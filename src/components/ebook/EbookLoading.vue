<template>
	<div class="ebook-loading">
		<div class="ebook-loading-wrapper">
			<div class="ebook-loading-item" 
					 v-for="(item,index) in data" :key="index">
				<div class="ebook-loading-line-wrapper"
						 v-for="(subItem,subIndex) in item" :key="subIndex">
					<div class="ebook-loading-line" ref="line"></div>
					<div class="ebook-loading-mask" ref="mask"></div>
				</div>
			</div>
			<div class="ebook-loading-center"></div>
		</div>
	</div>
</template>

<script>
	import { px2rem } from 'utils/utils'
	export default {
		name: "EbookLoading",
		data() {
			return {
				data: [
					[{}, {}, {}],
					[{}, {}, {}]
				],
				maskWidth: [0, 0, 0, 0, 0, 0],
				lineWidth: [16, 16, 16, 16, 16, 16],
				add: true,
				end: false
			}
		},
		mounted() {
			this.task = setInterval(() => {
				this.$refs.mask.forEach((item,index) => {
					const mask = this.$refs.mask[index]
					const line = this.$refs.line[index]
					const length = this.maskWidth.length
					let maskWidth = this.maskWidth[index]
					let lineWidth = this.lineWidth[index]

					if (this.add && maskWidth < 16) {
						if (index === 0 || this.maskWidth[index-1] >= 8) {
							this.maskWidth[index]++
							this.lineWidth[index]--
						}
					} else if (this.add && this.maskWidth[length - 1] === 16) {
						this.add = false
						this.end = true
					}

					if (this.end && lineWidth < 16) {
						if (index === 0 || this.lineWidth[index-1] >= 8) {
							this.maskWidth[index]--
							this.lineWidth[index]++
						}
					} else if (this.end && this.lineWidth[length-1] === 16) {
						this.add = true
						this.end = false
					}

					mask.style.width = `${px2rem(maskWidth)}rem`
					mask.style.flex = `0 0 ${px2rem(maskWidth)}rem`
					line.style.width = `${px2rem(lineWidth)}rem`
					line.style.flex = `0 0 ${px2rem(lineWidth)}rem`
				})
			}, 15)
		},
	}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";

.ebook-loading {
  position: relative;
  z-index: 400;
  width: px2rem(63);
  height: px2rem(40);
  background: transparent;
  border: px2rem(1.5) solid #d7d7d7;
  border-radius: px2rem(3);
  .ebook-loading-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    .ebook-loading-item {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: px2rem(7) 0;
      box-sizing: border-box;
      .ebook-loading-line-wrapper {
        flex: 1;
        padding: 0 px2rem(7);
        box-sizing: border-box;
        @include left;
        .ebook-loading-line {
          flex: 0 0 px2rem(16);
          width: px2rem(16);
          height: px2rem(2);
          background: #d7d7d7;
        }
        .ebook-loading-mask {
          flex: 0 0 0;
          width: 0;
          height: px2rem(2);
        }
      }
    }
    .ebook-loading-center {
      position: absolute;
      left: 50%;
      top: 0;
      width: px2rem(1.5);
      height: 100%;
      background: #d7d7d7;
    }
  }
}
</style>