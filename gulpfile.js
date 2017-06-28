"use strict";

const _ = require('lodash');
const gulp = require('gulp');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const mustache = require('gulp-mustache');
const apis = require('clayful-lib-spec/data/api.json');
const aliases = require('clayful-lib-spec/data/aliases.json');

const ext = '.php';

// Change arguments to string and add aliases
apis.forEach(a => {

	_.forEach(aliases, (v, k) => {

		if (!a.method.includes(k)) return;

		a.aliases = (a.aliases || []).concat(v.map(alias => a.method.replace(k, alias)));

	});

});

const byModel = _.groupBy(apis, a => a.className);

gulp.task('clean', () => {

	return gulp.src(['./clayful-php/src/Models/*'], { read: false })
		.pipe(clean());

});

gulp.task('models', ['clean'], () => {

	_.forEach(byModel, (apis, className) => {

		apis.forEach(a => {

			a.arguments = a.arguments.map((param, i) => ({
				name: _.camelCase(param),
				last: i === (a.arguments.length - 1)
			}));

		});

		gulp.src('./build/model.mustache')
			.pipe(mustache({
				modelName: _.camelCase(className),
				className: className,
				methods:   apis
			}))
			.pipe(rename(path => {
				path.basename = className; // php filename convention
				path.extname = ext;
			}))
			.pipe(gulp.dest(`./clayful-php/src/Models`));

	});

});

gulp.task('default', ['models']);