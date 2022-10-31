<template>
    <div class="hex_img">
        <img src="@/assets/hex.svg" class="hex_img" v-if="!isLux" />
        <img src="@/assets/hex_lux.svg" class="hex_img" v-else />
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class FungibleRow extends Vue {
    @Prop({ default: false }) isLux?: boolean
}
</script>
<style scoped lang="scss">
.hex_img {
    display: flex;
    justify-content: center;
    align-items: center;
}

img.hex_img {
    width: 100% !important;
    object-position: center;
    object-fit: contain;
}
</style>
