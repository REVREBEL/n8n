<script lang="ts" setup>
import { useUIStore } from '@/stores/ui.store';
import type { Banners } from 'n8n-workflow';

interface Props {
	name: Banners;
	theme?: string;
	customIcon?: string;
	dismissible?: boolean;
}

const uiStore = useUIStore();

const props = withDefaults(defineProps<Props>(), {
	theme: 'info',
	dismissible: true,
});

const emit = defineEmits(['close']);

async function onCloseClick() {
	await uiStore.dismissBanner(props.name);
	emit('close');
}
</script>
<template>
	<n8n-callout
		:theme="props.theme"
		:icon="props.customIcon"
		iconSize="medium"
		:roundCorners="false"
		:data-test-id="`banners-${props.name}`"
	>
		<div :class="$style.mainContent">
			<slot name="mainContent" />
		</div>
		<template #trailingContent>
			<div :class="$style.trailingContent">
				<slot name="trailingContent" />
				<n8n-icon
					v-if="dismissible"
					size="small"
					icon="times"
					title="Dismiss"
					class="clickable"
					:data-test-id="`banner-${props.name}-close`"
					@click="onCloseClick"
				/>
			</div>
		</template>
	</n8n-callout>
</template>

<style lang="scss" module>
.mainContent {
	display: flex;
	gap: var(--spacing-4xs);
}
.trailingContent {
	display: flex;
	align-items: center;
	gap: var(--spacing-l);
}
</style>
