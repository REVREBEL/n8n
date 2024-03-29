<template>
	<div
		:class="$style['expression-parameter-input']"
		v-on-click-outside="onBlur"
		@keydown.tab="onBlur"
	>
		<div :class="[$style['all-sections'], { [$style['focused']]: isFocused }]">
			<div
				:class="[
					$style['prepend-section'],
					'el-input-group__prepend',
					{ [$style['squared']]: isForRecordLocator },
				]"
			>
				<ExpressionFunctionIcon />
			</div>
			<InlineExpressionEditorInput
				:modelValue="modelValue"
				:isReadOnly="isReadOnly"
				:targetItem="hoveringItem"
				:isSingleLine="isForRecordLocator"
				:path="path"
				@focus="onFocus"
				@blur="onBlur"
				@change="onChange"
				ref="inlineInput"
			/>
			<n8n-icon
				v-if="!isDragging"
				icon="external-link-alt"
				size="xsmall"
				:class="$style['expression-editor-modal-opener']"
				@click="$emit('modalOpenerClick')"
				data-test-id="expander"
			/>
		</div>

		<InlineExpressionEditorOutput
			:segments="segments"
			:isReadOnly="isReadOnly"
			:visible="isFocused"
			:hoveringItemNumber="hoveringItemNumber"
		/>
	</div>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

import { useNDVStore } from '@/stores/ndv.store';
import { useWorkflowsStore } from '@/stores/workflows.store';
import InlineExpressionEditorInput from '@/components/InlineExpressionEditor/InlineExpressionEditorInput.vue';
import InlineExpressionEditorOutput from '@/components/InlineExpressionEditor/InlineExpressionEditorOutput.vue';
import ExpressionFunctionIcon from '@/components/ExpressionFunctionIcon.vue';
import { createExpressionTelemetryPayload } from '@/utils/telemetryUtils';

import type { Segment } from '@/types/expressions';
import type { TargetItem } from '@/Interface';

type InlineExpressionEditorInputRef = InstanceType<typeof InlineExpressionEditorInput>;

export default defineComponent({
	name: 'ExpressionParameterInput',
	components: {
		InlineExpressionEditorInput,
		InlineExpressionEditorOutput,
		ExpressionFunctionIcon,
	},
	data() {
		return {
			isFocused: false,
			segments: [] as Segment[],
		};
	},
	props: {
		path: {
			type: String,
		},
		modelValue: {
			type: String,
		},
		isReadOnly: {
			type: Boolean,
			default: false,
		},
		isForRecordLocator: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		...mapStores(useNDVStore, useWorkflowsStore),
		hoveringItemNumber(): number {
			return this.ndvStore.hoveringItemNumber;
		},
		hoveringItem(): TargetItem | null {
			return this.ndvStore.getHoveringItem;
		},
		isDragging(): boolean {
			return this.ndvStore.isDraggableDragging;
		},
	},
	methods: {
		focus() {
			const inlineInputRef = this.$refs.inlineInput as InlineExpressionEditorInputRef | undefined;
			if (inlineInputRef?.$el) {
				inlineInputRef.focus();
			}
		},
		onFocus() {
			this.isFocused = true;

			this.$emit('focus');
		},
		onBlur(event: FocusEvent | KeyboardEvent) {
			if (
				event.target instanceof Element &&
				Array.from(event.target.classList).some((_class) => _class.includes('resizer'))
			) {
				return; // prevent blur on resizing
			}

			if (this.isDragging) return; // prevent blur on dragging

			const wasFocused = this.isFocused;

			this.isFocused = false;

			this.$emit('blur');

			if (wasFocused) {
				const telemetryPayload = createExpressionTelemetryPayload(
					this.segments,
					this.modelValue,
					this.workflowsStore.workflowId,
					this.ndvStore.sessionId,
					this.ndvStore.activeNode?.type ?? '',
				);

				this.$telemetry.track('User closed Expression Editor', telemetryPayload);
			}
		},
		onChange({ value, segments }: { value: string; segments: Segment[] }) {
			if (this.isDragging) return;

			this.segments = segments;

			if (value === '=' + this.modelValue) return; // prevent report on change of target item

			this.$emit('update:modelValue', value);
		},
	},
});
</script>

<style lang="scss" module>
.expression-parameter-input {
	position: relative;

	.all-sections {
		height: 30px;
		display: flex;
		flex-direction: row;
		display: inline-table;
		width: 100%;
	}

	.prepend-section {
		padding: 0;
		padding-top: 2px;
		width: 22px;
		text-align: center;
	}

	.squared {
		border-radius: 0;
	}
}

.expression-editor-modal-opener {
	position: absolute;
	right: 0;
	bottom: 0;
	background-color: white;
	padding: 3px;
	line-height: 9px;
	border: var(--border-base);
	border-top-left-radius: var(--border-radius-base);
	border-bottom-right-radius: var(--border-radius-base);
	cursor: pointer;

	svg {
		width: 9px !important;
		height: 9px;
		transform: rotate(270deg);

		&:hover {
			color: var(--color-primary);
		}
	}
}

.focused > .prepend-section {
	border-color: var(--color-secondary);
	border-bottom-left-radius: 0;
}

.focused :global(.cm-editor) {
	border-color: var(--color-secondary);
}

.focused > .expression-editor-modal-opener {
	border-color: var(--color-secondary);
	border-bottom-right-radius: 0;
	background-color: white;
}
</style>
