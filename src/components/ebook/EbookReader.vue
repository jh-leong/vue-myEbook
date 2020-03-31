<template>
	<div class="ebook-reader">
		<div id="read"></div>
		<div class="ebook-reader-mask"
				 @click="onMaskClick"
				 @touchmove="move"
				 @touchend="moveEnd"
				 @mousedown.left="onMouseEnter"
				 @mousemove.left="onMouseMove"
				 @mouseup.left="onMouseEnd">
		</div>
	</div>
</template>

<script>
	import { ebookMixin } from 'utils/mixin'
	import { flatten } from 'utils/book'
	import { 
		getFontFamily,
		saveFontFamily,
		getFontSize,
		saveFontSize,
		getTheme,
		saveTheme,
		getLocation,
	} from 'utils/localStorage'
	import Epub from 'epubjs'

	global.ePub = Epub
	export default {
		name: "EbookReader",
		mixins: [ebookMixin],
		mounted() {
			const fileName = this.$route.params.fileName.split('|').join('/')
			this.setFileName(fileName).then(() => {
				this.initEpub()
			})
		},
		methods: {
			onMouseEnter(e) {
				this.mouseState = 1
				e.preventDefault()
				e.stopPropagation()
			},
			onMouseMove(e) {
				if (this.mouseState === 1) {
					this.mouseState = 2
				} else if (this.mouseState === 2) {
					let offsetY = 0
					if (this.firstOffsetY) {
						offsetY = e.clientY - this.firstOffsetY
						this.setOffsetY(offsetY)
					} else {
						this.firstOffsetY = e.clientY
					}
				}
				e.preventDefault()
				e.stopPropagation()
			},
			onMouseEnd(e) {
				if (this.mouseState === 2) {
					this.setOffsetY(0)
					this.firstOffsetY = null
					this.mouseState = 3
				} else {
					this.mouseState = 4
				}
				e.preventDefault()
				e.stopPropagation()
			},
			move(e) {
				let offsetY = 0
				if (this.firstOffsetY) {
					offsetY = e.changedTouches[0].clientY - this.firstOffsetY
					this.setOffsetY(offsetY)
				} else {
					this.firstOffsetY = e.changedTouches[0].clientY
				}
				e.preventDefault()
				e.stopPropagation()
			},
			moveEnd(e) {
				this.setOffsetY(0)
				this.firstOffsetY = null
			},
			initEpub() {
				const url = `${process.env.VUE_APP_RES_URL}/epub/` + this.fileName + '.epub'
				// 1.ebook的解析和渲染
				this.book = new Epub(url)
				this.setCurrentBook(this.book)
				this.initRenDition()
				// 2.定义操作手势
				this.initGesture()

				// 获取书本信息用于展示
				this.parseBook()

				// 当ebook全部解析完成后会调用ready方法, 才能实现分页功能
				this.book.ready.then(() => {
					// 传入参数为：每一页需要显示的文字数, default:150
					return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName)) / 16)
				}).then(locations => {
					this.setBookAvailable(true)
					this.refreshLocation()
				})
			},
			parseBook() {
				// 1.返回封面图片
				this.book.loaded.cover.then(cover => {
					// 该方法返回一个图片的blod链接
					this.book.archive.createUrl(cover).then(url => {
						this.setCover(url)
					})
				})
				// 2.获取metadata书籍基本信息
				this.book.loaded.metadata.then(metadata => {
					this.setMetadata(metadata)
				})
				// 3.获取目录信息
				this.book.loaded.navigation.then(nav => {
					const navItem = flatten(nav.toc)
					function find(item ,level = 0) {
						return !item.parent ? level : find(navItem.filter(parentItem => parentItem.id === item.parent)[0], ++level)
					}
					navItem.forEach(item => {
						item.level = find(item)
					})
					this.setNavigation(navItem)
				})
			},
			initRenDition() {
				this.rendition = this.book.renderTo('read', {
					width: innerWidth,
					height: innerHeight,
					// 为了支持微信下使用，必须加
					method: 'default'
				})
				const location = getLocation(this.fileName)
				this.display(location, () => {
					this.initTheme()
					this.initFontSize()
					this.initFontFamily()
					this.initGlobalStyle()
				})
				// hooks回调函数，当阅读器渲染完成可以调用资源文件后
				// 调用register方法
				this.rendition.hooks.content.register(contents => {
					// 由于ebook是基于ifame实现的，是一个独立的dom外部没办法直接修改其样式
					// 得先手动添加手动添加样式文件后, 在外部才能通过rendition改变字体样式
					// 传入参数为url
					Promise.all([
						contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
						contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
						contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
						contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
					]).then(() => {})
				})
			},
			initGesture() {
				this.rendition.on('touchstart', event => {
					this.touchStartX = event.changedTouches[0].clientX
					this.touchStartTime = event.timeStamp
				})
				this.rendition.on('touchend', event => {
					const offsetX = event.changedTouches[0].clientX - this.touchStartX
					const time = event.timeStamp - this.touchStartTime
					if (time < 500 && offsetX > 40) {
						this.prevPage()
					} else if (time < 500 && offsetX < -40) {
						this.nextPage()
					} else {
						this.toggleTitleAndMenu()
					}
					// event.preventDefault()
					event.stopPropagation()
				})
			},
			initTheme() {
				let defaultTheme = getTheme(this.fileName)
				if (!defaultTheme) {
					defaultTheme = this.themeList[0].name
					saveTheme(this.fileName, defaultTheme)
				}
				this.setDefaultTheme(defaultTheme)
				this.themeList.forEach(theme => {
					this.rendition.themes.register(theme.name, theme.style)
				})
				this.rendition.themes.select(defaultTheme)
			},
			initFontSize() {
				// 初始化fontSize
				let fontSize = getFontSize(this.fileName)
				if (!fontSize) {
					saveFontSize(this.fileName, this.defaultFontSize)
				} else {
					this.rendition.themes.fontSize(fontSize)
					this.setDefaultFontSize(fontSize)
				}
			},
			initFontFamily() {
				// 初始化fontFamily
				let font = getFontFamily(this.fileName)
				if (!font) {
					saveFontFamily(this.fileName, this.defaultFontFamily)
				} else {
					this.rendition.themes.font(font)
					this.setDefaultFontFamily(font)
				}
			},
			prevPage() {
				if (this.rendition) {
					this.rendition.prev().then(() => {
						this.refreshLocation()
					})
					this.hideTitleAndMenu()
				}
			},
			nextPage() {
				if (this.rendition) {
					this.rendition.next().then(() => {
						this.refreshLocation()
					})
					this.hideTitleAndMenu()
				}
			},
			toggleTitleAndMenu() {
				this.setMenuVisible(!this.menuVisible) 
				this.setSettingVisible(-1)
				this.setFontFamilyVisible(false)
			},
			onMaskClick(e) {
				if (this.mouseState && this.mouseState === 2 || this.mouseState === 3) {
					return 
				}
				const offsetX = e.offsetX
				const width = window.innerWidth
				if (offsetX > 0 && offsetX < width * 0.3) {
					this.prevPage()
				} else if (offsetX > 0 && offsetX > width * 0.7) {
					this.nextPage()
				} else {
					this.toggleTitleAndMenu()
				}
			}
		},
	}
</script>

<style lang='scss' scoped>
@import 'assets/styles/global';
.ebook-reader {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .ebook-reader-mask {
    position: absolute;
    top: 0;
    left: 0;
    background: transparent;
    z-index: 150;
    width: 100%;
    height: 100%;
  }
}
</style>