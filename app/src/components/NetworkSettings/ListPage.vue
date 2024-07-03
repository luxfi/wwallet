<template>
    <div>
        <div class="networks_list">
            <network-row
                data-cy="network-item"
                v-for="net in networks"
                :key="net.id"
                class="network_row"
                :network="net"
                @edit="onEdit(net)"
            ></network-row>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator'

import NetworkRow from './NetworkRow.vue'
import { LuxNetwork } from '@/js/LuxNetwork'

@Component({
    components: {
        NetworkRow,
    },
})
class ListPage extends Vue {
    get networks(): LuxNetwork[] {
        return this.$store.getters['Network/allNetworks']
    }

    onEdit(net: LuxNetwork) {
        this.$emit('edit', net)
    }
}
export default toNative(ListPage)
</script>
<style scoped lang="scss">
.networks_list {
    padding: 0px 15px;
}
</style>
