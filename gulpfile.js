/* global require process Buffer */
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var saveLicense = require('uglify-save-license');
var pkg = require('./package.json');
var zip = require('gulp-zip');

var DIST = './dist',
	SRC = './src',
	NAME = pkg.name,
	VERSION = process.env.VERSION || 'local-dev';

gulp.task('qext', function () {
	var qext = {
		name: 'Tabbed container',
		type: 'visualization',
		description: pkg.description + '\nVersion: ' + VERSION,
		version: VERSION,
		icon: 'folder',
		preview: 'preview.png',
		keywords: 'qlik-sense, visualization',
		author: pkg.author,
		homepage: pkg.homepage,
		license: pkg.license,
		repository: pkg.repository,
		dependencies: {
			'qlik-sense': '>=5.5.x'
		},
		deprecated: '2019-06-27'
	};
	if (pkg.contributors) {
		qext.contributors = pkg.contributors;
	}
	var src = require('stream').Readable({
		objectMode: true
	});
	src._read = function () {
		this.push(new gutil.File({
			cwd: '',
			base: '',
			path: NAME + '.qext',
			contents: Buffer.from(JSON.stringify(qext, null, 4))
		}));
		this.push(null);
	};
	return src.pipe(gulp.dest(DIST));
});

gulp.task('clean', function (ready) {
	var del = require('del');
	del.sync([DIST]);
	ready();
});

gulp.task('add-assets', function () {
	return gulp.src([
		SRC + '/**/*.png',
		SRC + '/**/*.css'
	]).pipe(gulp.dest(DIST));
});

gulp.task('zip-build', function () {
	return gulp.src(DIST + '/**/*')
		.pipe(zip(`${NAME}_${VERSION}.zip`))
		.pipe(gulp.dest(DIST));
});

gulp.task('add-src', function () {
	return gulp.src(SRC + '/**/*.js')
		.pipe(uglify({
			output: {
				comments: saveLicense
			}
		}))
		.pipe(gulp.dest(DIST));
});

gulp.task('build',
	gulp.series('clean', 'qext', 'add-assets', 'add-src')
);

gulp.task('zip',
	gulp.series('build', 'zip-build')
);

gulp.task('default',
	gulp.series('build')
);
