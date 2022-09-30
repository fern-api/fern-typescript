FROM node:18.1.0-alpine
COPY packages/generators/sdk/cli/docker/dist/bundle.js /bundle.js

# copy zurg and delete all tests
COPY packages/zurg/src/ /assets/zurg
RUN find /assets/zurg -name __test__ -exec rm -rf {} \+

# copy fetcher
COPY packages/fetcher/src/ /assets/fetcher

ENTRYPOINT ["node", "/bundle.js"]
