<template>
	<div class="menu-bar">
		<transition name='slide-up'>
			<div class="menu-wrapper" 
					 v-show='menuVisible'
					 :class='{"hide-box-shadow":!menuVisible || settingVisible >= 0}'>
				<div class="icon-wrapper">
					<span class="icon-menu" @click='showSetting(3)'></span>
				</div>
				<div class="icon-wrapper">
					<span class="icon-progress" @click='showSetting(2)'></span>
				</div>
				<div class="icon-wrapper">
					<span class="icon-bright" @click='showSetting(1)'></span>
				</div>
				<div class="icon-wrapper">
					<span class="icon-A" @click='showSetting(0)'></span>
				</div>
			</div>
		</transition>
		<ebook-setting-font></ebook-setting-font>
		<ebook-font-popup></ebook-font-popup>
		<ebook-setting-theme></ebook-setting-theme>
		<ebook-set-progress></ebook-set-progress>
		<ebook-slide></ebook-slide>

	</div>
</template>

<script>
	import { ebookMixin } from 'utils/mixin'

	import EbookSettingFont from './menuChild/EbookSettingFont'
	import EbookFontPopup from './menuChild/EbookFontPopup'
	import EbookSettingTheme from './menuChild/EbookSettingTheme'
	import EbookSetProgress from './menuChild/EbookSetProgress'
	import EbookSlide from './menuChild/EbookSlide'

	export default {
		name: "EbookMenu",
		mixins: [ebookMixin],
		components: {
			EbookSettingFont,
			EbookFontPopup,
			EbookSettingTheme,
			EbookSetProgress,
			EbookSlide
		},
		methods: {
			showSetting(key) {
				this.setSettingVisible(key)
			}
		}
	}
</script>

<style lang='scss' scoped>
@import 'assets/styles/global';

.menu-bar {
	.menu-wrapper {
		position: absolute;
		bottom: 0;
		left: 0;
		z-index: 200;
		display: flex;
		width: 100%;
		height: px2rem(44);
		background: white;
		box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);
		font-size: px2rem(20);
		&.hide-box-shadow {
			box-shadow: none;
		}
		.icon-wrapper {
			flex: 1;
			@include center;
		}
	}
}
</style>