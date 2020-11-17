const { Logger } = require("../../utils");

const log = async (str, mess) => {
  logger = Logger;
  await logger.info("%s : %O", str, mess);

  // logger.warn("Warning log");
  // logger.error(new Error("Error log"));

  // logger.log({
  //   level: "info",
  //   message: "Hello distributed log files!",
  // });

  // //Hoặc như thế này
  // logger.info("Hello again distributed logs");
};

module.exports = {
  log,
};
