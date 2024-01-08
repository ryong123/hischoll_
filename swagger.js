const swaggerAutogen = require("swagger-autogen")({ language: "ko" });
require("dotenv").config();
const env = process.env;

const doc = {
  info: {
    title: "HiSchool",
    description: "",
  },
  host: `localhost:${env.PORT}`,
  schemes: ["http"],
  // schemes: ["https" ,"http"],
};

const outputFile = "./swagger-output.json"; // 같은 위치에 swagger-output.json을 만든다.
const endpointsFiles = [
  "./index.js", // 라우터가 명시된 곳을 지정해준다.
];

swaggerAutogen(outputFile, endpointsFiles, doc);
