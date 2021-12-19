import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import invariant from "invariant";
import {
  startsWith,
  pick,
  resolve,
  match,
  insertParams,
  validateRedirect,
  shallowCompare,
} from "./utils.js";
import { createHistory, createMemorySource } from "./history.js";

////////////////////////////////////////////////////////////////////////////////

const createNamedContext = (name, defaultValue) => {
  const Ctx = createContext(defaultValue);
  Ctx.displayName = name;
  return Ctx;
};

////////////////////////////////////////////////////////////////////////////////
// Location Context/Provider
let LocationContext = createNamedContext("Location");

// sets up a listener if there isn't one already so apps don't need to be
// wrapped in some top level provider
var Location = ({ children }) => (
  <LocationContext.Consumer>
    {(context) =>
      context ? (
        children(context)
      ) : (
        <LocationProvider>{children}</LocationProvider>
      )
    }
  </LocationContext.Consumer>
);

Location.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

function LocationProvider({ children, history }) {
  const [context, setContext] = useState();

  useEffect(
    () =>
      history.listen(() => {
        let { navigate, location } = history;
        let context = { navigate, location };
        setContext(context);
      }),
    [history],
  );

  return (
    <LocationContext.Provider value={context}>
      {typeof children === "function" ? children(context) : children || null}
    </LocationContext.Provider>
  );
}

LocationProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  history: PropTypes.object.isRequired,
};

////////////////////////////////////////////////////////////////////////////////

var ServerLocation = ({ url, children }) => {
  let searchIndex = url.indexOf("?");
  let searchExists = searchIndex > -1;
  let pathname;
  let search = "";
  let hash = "";

  if (searchExists) {
    pathname = url.substring(0, searchIndex);
    search = url.substring(searchIndex);
  } else {
    pathname = url;
  }

  return (
    <LocationContext.Provider
      value={{
        location: {
          pathname,
          search,
          hash,
        },
        navigate: () => {
          throw new Error("You can't call navigate on the server.");
        },
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

ServerLocation.propTypes = {
  children: PropTypes.node,
  url: PropTypes.string.isRequired,
};

////////////////////////////////////////////////////////////////////////////////
// Sets baseuri and basepath for nested routers and links
let BaseContext = createNamedContext("Base", {
  baseuri: "/",
  basepath: "/",
  navigate: k,
});

////////////////////////////////////////////////////////////////////////////////
// The main event, welcome to the show everybody.
let Router = (props) => (
  <BaseContext.Consumer>
    {(baseContext) => (
      <Location>
        {(locationContext) => (
          <RouterImpl {...baseContext} {...locationContext} {...props} />
        )}
      </Location>
    )}
  </BaseContext.Consumer>
);

RouterImpl.propTypes = {
  basepath: PropTypes.string.isRequired,
  children: PropTypes.node,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired,
  navigate: PropTypes.func.isRequired,
};

function RouterImpl({ location, navigate, basepath, children }) {
  let routes = React.Children.toArray(children).reduce((array, child) => {
    const routes = createRoute(basepath)(child);
    return array.concat(routes);
  }, []);
  let { pathname } = location;

  let match = pick(routes, pathname);

  if (match) {
    let {
      params,
      uri,
      route,
      route: { value: element },
    } = match;

    // remove the /* from the end for child routes relative paths
    basepath = route.default ? basepath : route.path.replace(/\*$/, "");

    let props = {
      ...params,
      uri,
      location,
      navigate: (to, options) => navigate(resolve(to, uri), options),
    };

    let clone = React.cloneElement(
      element,
      props,
      element.props.children ? (
        <Router location={location}>{element.props.children}</Router>
      ) : undefined,
    );

    return (
      <BaseContext.Provider
        value={{ baseuri: uri, basepath, navigate: props.navigate }}
      >
        {clone}
      </BaseContext.Provider>
    );
  } else {
    // Not sure if we want this, would require index routes at every level
    // warning(
    //   false,
    //   `<Router basepath="${basepath}">\n\nNothing matched:\n\t${
    //     location.pathname
    //   }\n\nPaths checked: \n\t${routes
    //     .map(route => route.path)
    //     .join(
    //       "\n\t"
    //     )}\n\nTo get rid of this warning, add a default NotFound component as child of Router:
    //   \n\tlet NotFound = () => <div>Not Found!</div>
    //   \n\t<Router>\n\t  <NotFound default/>\n\t  {/* ... */}\n\t</Router>`
    // );
    return null;
  }
}

let k = () => {};

////////////////////////////////////////////////////////////////////////////////
let { forwardRef } = React;
if (typeof forwardRef === "undefined") {
  forwardRef = (C) => C;
}

var Link = forwardRef(({ innerRef, ...props }, ref) => (
  <BaseContext.Consumer>
    {({ baseuri }) => (
      <Location>
        {({ location, navigate }) => {
          let { to, state, replace, getProps = k, ...anchorProps } = props;
          let href = resolve(to, baseuri);
          let encodedHref = encodeURI(href);
          let isCurrent = location.pathname === encodedHref;
          let isPartiallyCurrent = startsWith(location.pathname, encodedHref);

          return (
            <a
              ref={ref || innerRef}
              aria-current={isCurrent ? "page" : undefined}
              {...anchorProps}
              {...getProps({ isCurrent, isPartiallyCurrent, href, location })}
              href={href}
              onClick={(event) => {
                if (anchorProps.onClick) anchorProps.onClick(event);
                if (shouldNavigate(event)) {
                  event.preventDefault();
                  let shouldReplace = replace;
                  if (typeof replace !== "boolean" && isCurrent) {
                    const { key, ...restState } = { ...location.state };
                    void key;
                    shouldReplace = shallowCompare({ ...state }, restState);
                  }
                  navigate(href, {
                    state,
                    replace: shouldReplace,
                  });
                }
              }}
            />
          );
        }}
      </Location>
    )}
  </BaseContext.Consumer>
));

Link.displayName = "Link";

Link.propTypes = {
  innerRef: PropTypes.any,
  state: PropTypes.any,
  replace: PropTypes.any,
  getProps: PropTypes.func,
  to: PropTypes.string.isRequired,
};

////////////////////////////////////////////////////////////////////////////////
function RedirectRequest(uri) {
  this.uri = uri;
}

let isRedirect = (o) => o instanceof RedirectRequest;

let redirectTo = (to) => {
  throw new RedirectRequest(to);
};

function RedirectImpl({
  navigate,
  to,
  from,
  replace = true,
  state,
  noThrow,
  baseuri,
  ...props
}) {
  void from;

  useEffect(() => {
    let resolvedTo = resolve(to, baseuri);
    navigate(insertParams(resolvedTo, props), { replace, state });
  }, []);

  let resolvedTo = resolve(to, baseuri);
  if (!noThrow) redirectTo(insertParams(resolvedTo, props));
  return null;
}

let Redirect = (props) => (
  <BaseContext.Consumer>
    {({ baseuri }) => (
      <Location>
        {(locationContext) => (
          <RedirectImpl {...locationContext} baseuri={baseuri} {...props} />
        )}
      </Location>
    )}
  </BaseContext.Consumer>
);

Redirect.propTypes = {
  from: PropTypes.string,
  to: PropTypes.string.isRequired,
};

////////////////////////////////////////////////////////////////////////////////

var Match = ({ path, children }) => (
  <BaseContext.Consumer>
    {({ baseuri }) => (
      <Location>
        {({ navigate, location }) => {
          let resolvedPath = resolve(path, baseuri);
          let result = match(resolvedPath, location.pathname);
          return children({
            navigate,
            location,
            match: result
              ? {
                  ...result.params,
                  uri: result.uri,
                  path,
                }
              : null,
          });
        }}
      </Location>
    )}
  </BaseContext.Consumer>
);

Match.propTypes = {
  path: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
};

////////////////////////////////////////////////////////////////////////////////
// Hooks

const useLocation = () => {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error(
      "useLocation hook was used but a LocationContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router",
    );
  }

  return context.location;
};

const useNavigate = () => {
  const context = useContext(BaseContext);

  if (!context) {
    throw new Error(
      "useNavigate hook was used but a BaseContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router",
    );
  }

  return context.navigate;
};

const useParams = () => {
  const context = useContext(BaseContext);

  if (!context) {
    throw new Error(
      "useParams hook was used but a LocationContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router",
    );
  }

  const location = useLocation();

  const results = match(context.basepath, location.pathname);

  return results ? results.params : null;
};

const useMatch = (path) => {
  if (!path) {
    throw new Error(
      "useMatch(path: string) requires an argument of a string to match against",
    );
  }
  const context = useContext(BaseContext);

  if (!context) {
    throw new Error(
      "useMatch hook was used but a LocationContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router",
    );
  }

  const location = useLocation();

  const resolvedPath = resolve(path, context.baseuri);
  const result = match(resolvedPath, location.pathname);
  return result
    ? {
        ...result.params,
        uri: result.uri,
        path,
      }
    : null;
};

////////////////////////////////////////////////////////////////////////////////
// Junk
let stripSlashes = (str) => str.replace(/(^\/+|\/+$)/g, "");

let createRoute = (basepath) => (element) => {
  if (!element) {
    return null;
  }

  if (element.type === React.Fragment && element.props.children) {
    return React.Children.map(element.props.children, createRoute(basepath));
  }
  invariant(
    element.props.path || element.props.default || element.type === Redirect,
    `<Router>: Children of <Router> must have a \`path\` or \`default\` prop, or be a \`<Redirect>\`. None found on element type \`${element.type}\``,
  );

  invariant(
    !(element.type === Redirect && (!element.props.from || !element.props.to)),
    `<Redirect from="${element.props.from}" to="${element.props.to}"/> requires both "from" and "to" props when inside a <Router>.`,
  );

  invariant(
    !(
      element.type === Redirect &&
      !validateRedirect(element.props.from, element.props.to)
    ),
    `<Redirect from="${element.props.from} to="${element.props.to}"/> has mismatched dynamic segments, ensure both paths have the exact same dynamic segments.`,
  );

  if (element.props.default) {
    return { value: element, default: true };
  }

  let elementPath =
    element.type === Redirect ? element.props.from : element.props.path;

  let path =
    elementPath === "/"
      ? basepath
      : `${stripSlashes(basepath)}/${stripSlashes(elementPath)}`;

  return {
    value: element,
    default: element.props.default,
    path: element.props.children ? `${stripSlashes(path)}/*` : path,
  };
};

let shouldNavigate = (event) =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

////////////////////////////////////////////////////////////////////////
export {
  Link,
  Location,
  LocationProvider,
  Match,
  Redirect,
  Router,
  ServerLocation,
  createHistory,
  createMemorySource,
  isRedirect,
  redirectTo,
  match as matchPath,
  useLocation,
  useNavigate,
  useParams,
  useMatch,
};
