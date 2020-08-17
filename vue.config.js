module.exports = {
  css: {
    loaderOptions: {
      // pass options to sass-loader
      // @/ is an alias to src/
      // so this assumes you have a file named `src/variables.sass`
      // Note: this option is named as "prependData" in sass-loader v8
      sass: {
          sassOptions: {
              includePaths: ['./node_modules'],
          },
          // additionalData: `@import "@primer/css/index.scss";`
      },
    }
  }
}
