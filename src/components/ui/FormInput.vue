<template>
  <div class="form-input-group">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
    </label>

    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      class="form-input"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <div v-if="error" class="input-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  id: String,
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  required: Boolean,
  error: String
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.form-input-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.input-error {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
}
</style>
