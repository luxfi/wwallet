<template>
    <div>
        <v-checkbox
            :label="explain"
            v-model="localValue"
            @change="change"
            class="checkbox"
        ></v-checkbox>
    </div>
</template>

<script>
export default {
    props: {
        value: Boolean,
        explain: {
            type: String,
            default: 'Back up your mnemonic keyphrase!',
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
    model: {
        prop: 'value',
        event: 'change',
    },
    methods: {
        change() {
            this.$emit('update:value', this.localValue)
        },
    },
}
</script>

<style lang="scss">
@use "../../main";

.checkbox {
    .v-label {
        color: var(--primary-color);
    }

    .v-input--selection-controls__input {
        > * {
            color: var(--primary-color) !important;
        }
    }

    .v-input--selection-controls__ripple {
        color: var(--secondary-color) !important;
    }
}
</style>
