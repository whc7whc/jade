<template>
  <div v-if="show" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); z-index: 1070;">
    <div class="modal-dialog modal-dialog-centered" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">顏色選擇</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <div class="modal-body">
          <!-- 預設顏色選項 -->
          <div class="mb-4">
            <h6 class="fw-semibold mb-3">預設顏色</h6>
            <div class="row g-2">
              <div 
                v-for="option in colorOptions" 
                :key="option.value"
                class="col-auto"
              >
                <div 
                  class="rounded-circle border d-flex align-items-center justify-content-center fw-bold color-option"
                  style="width: 48px; height: 48px; cursor: pointer; transition: all 0.2s;"
                  :style="{ 
                    backgroundColor: option.color,
                    color: getTextColor(option.color)
                  }"
                  @click="selectColor(option.color, option.label)"
                  :title="`選擇 ${option.label} 色`"
                >
                  {{ option.label }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 自訂顏色 -->
          <div>
            <h6 class="fw-semibold mb-3">自訂顏色</h6>
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <input
                  type="color"
                  :value="customColor"
                  @input="updateCustomColor($event.target.value)"
                  class="form-control form-control-color"
                  style="width: 48px; height: 48px;"
                />
              </div>
              <div class="col">
                <input
                  type="text"
                  :value="customColor"
                  @input="updateCustomColor($event.target.value)"
                  placeholder="#000000"
                  class="form-control"
                />
              </div>
              <div class="w-100 d-none d-md-block"></div>
              <div class="col-12 col-md">
                <input 
                  type="text" 
                  v-model.trim="customName" 
                  placeholder="請輸入顏色名稱 (例如：櫻花粉)" 
                  class="form-control"
                />
              </div>
              <div class="col-auto">
                <button
                  @click="selectCustomColor()"
                  class="btn btn-primary"
                >
                  選擇
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorPicker',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    colorOptions: {
      type: Array,
      required: true
    },
    customColor: {
      type: String,
      default: '#000000'
    }
  },
  emits: ['close', 'select-color', 'update-custom-color'],
  data() {
    return {
      customName: ''
    }
  },
  methods: {
    selectColor(colorValue, colorLabel) {
      this.$emit('select-color', colorValue, colorLabel)
    },

    updateCustomColor(value) {
      this.$emit('update-custom-color', value)
    },

    selectCustomColor() {
      const name = (this.customName || '').trim()
      const hex = (this.customColor || '').trim()
      // 基本格式修正
      const formattedHex = hex && !hex.startsWith('#') ? `#${hex}` : hex
      const finalName = name || '自訂色'
      this.$emit('select-color', formattedHex, finalName)
    },

    getTextColor(backgroundColor) {
      if (backgroundColor === '#FFFFFF' || backgroundColor === '#EAB308' || backgroundColor === '#F97316') {
        return '#000000'
      }
      return '#FFFFFF'
    }
  }
}
</script>

<style scoped>
.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Modal 動畫 */
.modal.d-block {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
