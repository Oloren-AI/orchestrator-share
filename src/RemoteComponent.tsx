/**
 * This is a testing ground component for loading remote components.
 *
 * It is NOT production ready or type safe yet - so the code is isolated here.
 */

import { Button } from "antd";
import React, { Suspense, useState } from "react";
import ErrorBound from "./ErrorBoundary";

function loadComponent(scope: string, module: string) {
  return async () => {
    await __webpack_init_sharing__("default");
    // @ts-ignore
    const container = window[scope]; // or get the container somewhere else

    await container.init(__webpack_share_scopes__.default);
    // @ts-ignore
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}

export const urlCache = new Set();
const useDynamicScript = (url: string) => {
  const [ready, setReady] = React.useState(false);
  const [errorLoading, setErrorLoading] = React.useState(false);

  React.useEffect(() => {
    if (!url) return;

    if (urlCache.has(url)) {
      setReady(true);
      setErrorLoading(false);
      return;
    }

    setReady(false);
    setErrorLoading(false);

    const element = document.createElement("script");
    element.className = "remote-script";

    element.src = url;
    element.type = "text/javascript";
    element.async = true;

    element.onload = () => {
      urlCache.add(url);
      setReady(true);
    };

    element.onerror = () => {
      setReady(false);
      setErrorLoading(true);
    };

    document.head.appendChild(element);

    return () => {
      urlCache.delete(url);
      document.head.removeChild(element);
    };
  }, [url]);

  return {
    errorLoading,
    ready,
  };
};

export const componentCache = new Map();

export const useFederatedComponent = (
  remoteUrl: string,
  scope: string,
  module: string
) => {
  const key = `${remoteUrl}-${scope}-${module}`;
  const [Component, setComponent] = React.useState<any>(null);

  const { ready, errorLoading } = useDynamicScript(remoteUrl);

  React.useEffect(() => {
    if (Component) setComponent(null);
    // Only recalculate when key changes
  }, [key]);

  React.useEffect(() => {
    if (ready && !Component) {
      const Comp = React.lazy(loadComponent(scope, module));
      componentCache.set(key, Comp);
      setComponent(Comp);
    }
    // key includes all dependencies (scope/module)
  }, [Component, ready, key]);

  return { errorLoading, Component };
};

interface RemoteComponentProps {
  module: string;
  scope: string;
  url: string;
  params: any;
}

export default function RemoteComponent({
  module,
  scope,
  url,
  params,
}: RemoteComponentProps) {
  const { Component: FederatedComponent, errorLoading } = useFederatedComponent(
    url,
    scope,
    module
  );
  return (
    <ErrorBound>
      <Suspense fallback="Loading Button">
        {errorLoading ? (
          <p className="text-black">{`Error loading module "${module}"`}</p>
        ) : (
          FederatedComponent && <FederatedComponent {...params} />
        )}
      </Suspense>
    </ErrorBound>
  );
}
