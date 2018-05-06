const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  writing() {
    const pkgJSON = {
      dependencies: {
        config: '^1.30.0',
        glob: '^7.1.2',
        mongodb: '^3.0.7',
      },
    };

    this.fs.extendJSON(this.destinationPath('package.json'), pkgJSON);

    this.fs.copy(this.templatePath('config'), this.destinationPath('config'));
    this.fs.copy(this.templatePath('scripts'), this.destinationPath('scripts'));
  }

  install() {
    this.npmInstall();
  }
};
