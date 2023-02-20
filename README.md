# Hiring Manager APP

Hiring Manager App is the most modern and featureful application for reviewing, accepting, and rejecting candidates
created by the author in the past week.

## Application Architecture

Hiring Manager App consists of a client-server architecture backed by a single file RDBMS known as Sqlite. The tech
choices were made to optimize for developer UX and reduce OS dependencies. You just need a working node 18 install
and OSX or Linux to run it.

## (Not Suitable For) Deployment

This application is not suitable for production deploys, but if you really want to deploy it, consider
using CloudFront for serving UI resources and bundles and ECS/Fargate for the http server, fronted by something
with SSL certificates.

Application state will not be shared properly across tasks and could also get wiped out unpredictably,
so don't do that without first putting in a real DB.

Ideally, an app like this might consider having authenticated users with their own unique lists of candidates, not a global
shared state across all users.

## Getting started

Check out the project, then with a working node18/npm environment, run:
`npm install`. If you instead prefer yarn, use `yarn install` to take
advantage of the yarn lockfile.

Some scripts are defined in package.json, and can be run with `npm run <command>` or `yarn <command>`.
The most useful ones are:

- `dev`: Spin up development UI server and backend with hot-reload.
- `test`: Run the tests.

Once the server is running, you can navigate to localhost:5173, the default vite dev server port. From there, you are ready to start
accepting or rejecting candidates.

## Contributing

This project uses these tool choices:

- React: DOM differ
- React-query: Simple REST-style query caching, mutations, and interactive updates
- TailwindCSS: A utility-class-first CSS library. I think it's the best one we have so far, but some past writings convinced me of the
  approach a long time ago:
  - https://nicolasgallagher.com/about-html-semantics-front-end-architecture/
  - https://adamwathan.me/css-utility-classes-and-separation-of-concerns/
  - I have used Material UI and some other CSS and component libraries in the past. I think Tailwind is the right amount of abstraction, especially if
    you are often switching between projects (I do).
- vite: initial project template and replacement for CRA I chose to use this time, and it was super easy.
- vitest: test runner and mocks: there were a lot of things that bothered me about jest, vitest seemed easier and faster.
- react-testing-library: React testing support
- ts-node: run typescript files in a node environment without pre-compilation
- koa: async-compatible http server and middleware stack I've used recently
- pino: structured logger I've used recently
- eslint: enforce style conventions (commit hook not yet implemented)
- prettier: auto-formatter to reduce style nitpicking on PRs

## Features

Hiring Manager App features a responsive layout to comfortably use on larger and smaller screen sizes. Using tailwind default
breakpoints, the users list view will fold under the user detail pane, and reduce the number of columns to the bare minimum on even smaller screens.

Assuming the desktop layout, on the left hand-side you will see user details for a new incoming candidate. You can approve or reject
and add an optional note. Once you do, the user will be processed and move to the right hand side. Note: if you do not act on a
particular user, for example by refreshing the page to get a new one, no history will be stored about that user.

On the right hand side, you see the list of processed users in most-recent-first order. You can click an existing one to change your
mind about them or edit the note. An edited note will not be saved until you accept or reject another time. Once you accept or reject,
you will receive another fresh random user to continue.

The list of processed users will persist across refreshes and across runs of the app unless the DB is wiped.

## Assumptions

- Port 3000 is open (but can override with SERVER_PORT)
- We can get user details using the randomuser API 'seed' field as if it were a reliable user ID, so we don’t need to store user display data.
- Randomuser will always return a unique new user unless passed a seed
- Integer pkeys are a reliable ordering for recency.
- Auth/user-state are not necessary
- Internationalization and accessibility are not concerns
- Users are using modern browsers and running javascript
- A SQLite file is an appropriate RDBMS for production
- Developers are running Linux or OSX only
- It’s appropriate to put server implementation under the same build as the UI implementation.
- It’s ok to leave WIP commits in the git history even if they are broken or not deployable
- There's infinitely many more, but this list is just some relevant ones

## Why write a server?

It didn't add much time since I've recently done similar work. It made the example app more realistic and provided API interfaces to test around,
which I did do. Most of the UI testing is done around mocks of the API calls to the real API, with data captured from the actual browser network
tab. As an added bonus, it's one way to get persistence across browsers and refreshes.

The API makes the UI less aware of the details of the assumptions around 'randomuser.me', especially using the 'seed'.

Once the server and UI were working correctly in tandem with hot-reloading (I hit some firefox-specific CORS issue again,
so had to use vite's proxy), feature development proceeded quickly.

If I were to spend a little more time on this, I'd consider adding some shared client/server code for parsing and validating calls and
results, and I'd also consider writing seed data for integration tests over temporary databases.
