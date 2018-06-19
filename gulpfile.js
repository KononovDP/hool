var gulp           = require('gulp'),
	sass           = require('gulp-sass'),
	browserSync    = require('browser-sync'),
	concat         = require('gulp-concat'),
	uglify         = require('gulp-uglify'),
	cleanCSS       = require('gulp-clean-css'),
	rename         = require('gulp-rename'),
	del            = require('del'),
	imagemin       = require('gulp-imagemin'),
	cache          = require('gulp-cache'),
	autoprefixer   = require('gulp-autoprefixer'),
	sourcemaps     = require('gulp-sourcemaps'),
	notify         = require("gulp-notify");


// Таск для преобразования .sass файлов в .css
gulp.task('sass', function() {
	// берем все .sass файлы по указанному шаблону
	return gulp.src('app/sass/**/*.sass')
	// инициализируем sourcemaps, чтобы в инспекторе отображался корректный путь к файлу
	.pipe(sourcemaps.init())
	// преобразовуем .sass в .css
	.pipe(sass({outputStyle: 'expanded'}).on("error", notify.onError()))
	// добавляем вендорные префиксы
	.pipe(autoprefixer(['last 15 versions']))
	// минифицируем стили
	.pipe(cleanCSS())
	// фиксируем sourcemaps
	.pipe(sourcemaps.write())
	// выгружаем полученные стили в указанную папку
	.pipe(gulp.dest('app/css'))
	// перезагружаем страницу в браузере
	.pipe(browserSync.reload({stream: true}));
});

// Таск для сбора сторонних .css файлов (плагины)
gulp.task('lib-css', function() {
	// указываем путь к необходимым файлам
	return gulp.src([])
	// склеиваем их в один файл, с учетом из порядка на предыдущем шаге 
	.pipe(concat('lib.min.css'))
	// минифицируем стили
	.pipe(cleanCSS())
	// выгружаем полученный файл в указанную папку
	.pipe(gulp.dest('app/css'));
});

// Таск для кастомных скриптов
gulp.task('js', function() {
	// берем файл скриптов
	return gulp.src('app/js/common.js')
	// минимизируем скрипты
	.pipe(uglify()) 
	// выгружаем его в указанную папку
	.pipe(gulp.dest('app/js'));
});

// Таск для сбора сторонних .js файлов (плагины)
gulp.task('lib-js', function() {
	// указываем путь к необходимым файлам
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/object-fit-images/dist/ofi.browser.js'
	])
	// склеиваем их в один файл, с учетом их порядка на предыдущем шаге 
	.pipe(concat('lib.min.js'))
	// минимизируем получившийся файл
	.pipe(uglify()) 
	// выгружаем полученные скрипты в указанную папку
	.pipe(gulp.dest('app/js'))
	// перезагружаем страницу в браузере
	.pipe(browserSync.reload({stream: true}));
});

// Таск для автоматической перезагрузки страницы в браузере
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			// указываем папку, при изменениях в которой, будет запускаться перезагрузка
			baseDir: 'app'
		},
		notify: false
	});
});

// Таск для автоматической отслеживания любых изменений в файлах
gulp.task('watch', ['sass', 'lib-css', 'js', 'lib-js', 'browser-sync'], function() {
	// смотрим за стилями
	gulp.watch('app/sass/**/*.sass', ['sass']);
	// смотрим за скриптами
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	// смотрим за html и перезагружаем страницу
	gulp.watch('app/*.html', browserSync.reload);
});

// Таск для оптимизации картинок
gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin())) // Cache Images
	.pipe(gulp.dest('dist/img')); 
});

// Таск для сборки проекта на продакшн
gulp.task('build', ['removedist', 'imagemin', 'sass', 'lib-css', 'js', 'lib-js'], function() {
	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/css/lib.min.css',
		'app/css/main.css'
		]).pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([
		'app/js/lib.min.js',
		'app/js/common.js'
		]).pipe(gulp.dest('dist/js'));

	var buildImg = gulp.src([
		'app/img/**/*',
		]).pipe(gulp.dest('dist/img'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));
});


gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
