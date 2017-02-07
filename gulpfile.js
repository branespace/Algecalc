var gulp = require('gulp');
var mocha = require('gulp-mocha');
var webpack = require('webpack-stream');

gulp.task('test', () =>
    gulp.src('test/test.js', {read: false})
	.pipe(mocha({reporter: 'spec'}))
);

gulp.task('pack', () =>
    gulp.src('./app/js/calc.js')
        .pipe(webpack({output: { filename: 'calc.js' }}))
        .pipe(gulp.dest('./build/'))
);

gulp.task('copy-files', () =>
    gulp.src('./app/**/*.html')
        .pipe(gulp.dest('./build/'))
);

gulp.task('build', ['pack', 'copy-files']);
