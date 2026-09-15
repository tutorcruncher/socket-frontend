# Releasing socket-frontend

Releases are single versioned bundles served from the CDN, e.g.
`https://cdn.tutorcruncher.com/socket/1.3.24/socket.js`. Customers embed a
versioned URL in their own site, so a new version only reaches them once they
update their snippet. Re-uploading an existing version replaces it in place for
everyone already using it.

The Travis pipeline in `.travis.yml` used to build and upload releases on tags,
but it has not run since October 2022. Until it is replaced (a GitHub Actions
workflow that runs `yarn dist` and syncs `dist/` to S3 on tags), releases are
built locally and uploaded by hand.

## Prerequisites

- **Node 14.** Webpack 4 and node-sass 4 do not work on newer Node. The repo
  has a `.node-version` file, so with [fnm](https://github.com/Schniz/fnm)
  initialised (`eval "$(fnm env --use-on-cd)"` in your shell rc) the correct
  version is selected when you `cd` into the repo. Check with `node -v`.
- `yarn install` run under Node 14 (so node-sass gets its binary).
- Write access to the `cdn.tutorcruncher.com` S3 bucket and the AWS CLI
  configured for it.

## Environment files

The production build is a standard Create React App build. CRA reads env files
in this priority order (highest first):

1. `.env.production.local`
2. `.env.local`
3. `.env.production`
4. `.env`

`.env` holds the real reCAPTCHA **site** key and `.env.production` holds the
production API URL, Sentry DSN and GA id. Both are committed. The `.local`
files are gitignored and meant for local testing. **They override the
production values, so make sure none exist before building a release**
(`ls -a | grep .env`). A build made with a local test captcha key ships the
"for testing purposes only" captcha and enquiries then fail server-side
verification.

The reCAPTCHA **secret** key is never used by the frontend. It lives only in
socket-server's config.

## Steps

1. Merge the PR into `master` and check out `master` with everything pulled.

2. Bump `version` in `package.json` (e.g. `1.3.24`) and commit it. The dist
   script refuses to build if the tag and package version differ.

3. Tag and push:

   ```sh
   git tag 1.3.24
   git push origin master 1.3.24
   ```

   Check `git tag` first: tags `1.3.22` and `1.3.23` exist but were never
   built or uploaded, so skip past them.

4. Build. `TRAVIS_*` are read by `dist.js` to set the CDN public path and the
   header comment at the top of `socket.js`:

   ```sh
   TRAVIS_TAG=1.3.24 TRAVIS_BRANCH=1.3.24 TRAVIS_COMMIT=$(git rev-parse HEAD) yarn dist
   ```

   This runs `yarn build`, renames the bundle to `socket.js`, copies
   `build/static/*` to `dist/1.3.24/` and prepends the version header. Output:
   `socket.js`, `socket.js.map`, `socket.js.LICENSE.txt`.

5. Verify the bundle before uploading:

   ```sh
   head -10 dist/1.3.24/socket.js                 # version / tag / commit header
   grep REACT_APP_GRECAPTCHA_KEY .env             # the real site key ...
   grep -c 6LdyXRgUAAAAADUNhMVKJDXiRr6DUN8TGOgllqbt dist/1.3.24/socket.js   # ... is in the bundle (expect 1)
   grep -c 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI dist/1.3.24/socket.js   # google test key (expect 0)
   grep -c 'https://socket.tutorcruncher.com' dist/1.3.24/socket.js         # production API (expect 1)
   ```

6. Upload to the CDN:

   ```sh
   aws s3 sync dist/1.3.24 s3://cdn.tutorcruncher.com/socket/1.3.24 --acl public-read
   ```

   Then confirm `https://cdn.tutorcruncher.com/socket/1.3.24/socket.js` serves
   the new header. If a cache sits in front of the bucket and you replaced an
   existing version, invalidate it.

7. Tell affected customers to update the version in their embed snippet, or
   update it for them if TutorCruncher manages their site.

## Dev builds

Without `TRAVIS_TAG`, `dist.js` builds to `dist/dev/<branch>/` with the public
path `https://cdn.tutorcruncher.com/socket/dev/<branch>/`. Upload that path the
same way to share a pre-release build.

## Local testing

`yarn start` serves the demo page from `public/index.html` on port 3000. Set
`public_key` there to a company that exists on the socket-server you are
pointing at, and put overrides such as `REACT_APP_SOCKET_API_URL` and a test
captcha key in `.env.local`. Remove or rename `.env.local` before building a
release. Because Create React App exits when it has no terminal on stdin, run
it as `CI=true BROWSER=none yarn start` if you start it from a script.
