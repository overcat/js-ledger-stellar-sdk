set -e

echo "Building tests with TypeScript"
npx tsc --project tsconfig.json

echo "Building tests with Parcel"
npx parcel build --no-cache --no-optimize test-builds/tsc/test/unit/*.js --dist-dir test-builds/parcel --target parcel_tests

echo "Building tests with Browserify"
npx browserify test-builds/tsc/test/unit/*.js > test-builds/browserify-build.js

echo "Building tests with webpack"
npx webpack -c ./test/webpack.config.js --mode development ./test-builds/tsc/test/unit/*.js --output-path ./test-builds
