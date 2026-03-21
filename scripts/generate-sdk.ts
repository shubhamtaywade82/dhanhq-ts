import { generate } from "openapi-typescript-codegen";

generate({
  input: "./openapi.json",
  output: "./src/generated",
  httpClient: "axios",
});
