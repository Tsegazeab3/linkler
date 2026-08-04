import React from 'react';
import { Link } from 'react-router-dom';
import RightArrowIcon from './RightArrowIcon';

function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-linkler-bg)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-ui-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-ui-text-main">Log In</h2>
        <form className="mt-8 space-y-6" action="#" method="POST">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 text-ui-text-main placeholder-ui-muted border border-ui-border rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-accent-indigo focus:border-accent-indigo focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 text-ui-text-main placeholder-ui-muted border border-ui-border rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-accent-indigo focus:border-accent-indigo focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 text-accent-indigo border-ui-border rounded focus:ring-accent-indigo"
              />
              <label htmlFor="remember-me" className="block ml-2 text-sm text-ui-text-secondary">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" title="Forgot your password?" className="font-medium text-accent-indigo hover:text-accent-indigo/80">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-accent-indigo border border-transparent rounded-md group hover:bg-accent-indigo/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-indigo"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <RightArrowIcon className="w-5 h-5 text-accent-indigo/40 group-hover:text-accent-indigo/60" />
              </span>
              Sign in
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ui-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-ui-muted bg-ui-white">Or continue with</span>
          </div>
        </div>

        <div>
          <a
            href="/accounts/google/login/?process=login"
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-ui-text-secondary bg-ui-white border border-ui-border rounded-md shadow-sm group hover:bg-ui-bg-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-indigo"
          >
            Sign in with Google
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
