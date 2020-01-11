const { expect } = require("chai");
const { hasDangerousChar } = require("../../src/utils/validate");

describe("validate", () => {
  it("validates strings with dangerous characters", () => {
    expect(hasDangerousChar("sdklf")).to.equal(false);
    expect(hasDangerousChar("sdfj'sdfsd")).to.equal(true);
    expect(hasDangerousChar("sdklf`sdfsdf")).to.equal(true);
  });
});
