<template>
    <div class="display_copy">
        <input class="disp" type="text" disabled :value="localValue" />
        <copy-text :value="localValue" class="copy" @copy="onCopy" @update:value="updateValue">
            <fa icon="copy"></fa>
        </copy-text>
    </div>
</template>

<script>
import CopyText from '@/components/VComponents/CopyText.vue'
import { mapActions } from 'vuex'

export default {
    components: {
        CopyText,
    },
    props: {
        value: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            localValue: this.value,
        }
    },
    watch: {
        value(newVal) {
            this.localValue = newVal
        },
    },
    methods: {
        ...mapActions('Notifications', ['add']),
        onCopy() {
            this.add({
                title: 'Copy',
                message: 'Copied to clipboard.',
            })
            this.$emit('copy', this.localValue)
        },
        updateValue(newValue) {
            this.localValue = newValue
            this.$emit('update:value', newValue)
        },
    },
}
</script>
