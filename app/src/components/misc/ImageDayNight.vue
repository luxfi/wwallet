<template>
    <img v-if="isDay" :src="day" />
    <img v-else :src="night" />
</template>
<script lang="ts">
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator'

@Component
class ImageDayNight extends Vue {
    @Prop() day!: string
    @Prop() night!: string

    get isDay() {
        //@ts-ignore
        return this.$root.theme === 'day'
    }
}
export default toNative(ImageDayNight)
</script>
<style scoped lang="scss"></style>
