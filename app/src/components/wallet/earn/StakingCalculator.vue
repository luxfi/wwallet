<template>
    <div></div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator'

@Component
class StakingCalculator extends Vue {}
export default toNative(StakingCalculator)
</script>
