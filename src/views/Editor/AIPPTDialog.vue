<template>
  <div class="aippt-dialog">
    <div class="header">
      <span class="title">AIPPT</span>
      <span class="subtite" v-if="step === 'template'">从下方挑选合适的模板，开始生成PPT</span>
      <span class="subtite" v-else-if="step === 'outline'">确认下方内容大纲（点击编辑内容，右键添加/删除大纲项），开始选择模板</span>
      <span class="subtite" v-else-if="step === 'manual-outline'">在下方输入您的PPT大纲内容</span>
      <span class="subtite" v-else>在下方输入您的PPT主题，并适当补充信息，如行业、岗位、学科、用途等</span>
    </div>
    
    <template v-if="step === 'setup'">
      <Input class="input" 
        ref="inputRef"
        v-model:value="keyword" 
        :maxlength="50" 
        placeholder="请输入PPT主题，如：大学生职业生涯规划" 
        @enter="createOutline()"
      >
        <template #suffix>
          <span class="count">{{ keyword.length }} / 50</span>
          <span class="language" v-tooltip="'切换语言'" @click="language = language === '中文' ? '英文' : '中文'">{{ language === '中文' ? '中' : '英' }}</span>
          <div class="submit manual-btn" @click="step = 'manual-outline'">手动输入大纲</div>
          <div class="submit" type="primary" @click="createOutline()"><IconSend class="icon" /> AI 生成</div>
        </template>
      </Input>
      <div class="recommends">
        <div class="recommend" v-for="(item, index) in recommends" :key="index" @click="setKeyword(item)">{{ item }}</div>
      </div>
      <div class="model-selector">
        <div class="label">选择AI模型：</div>
        <Select
          style="width: 160px;"
          v-model:value="model"
          :options="[
            { label: 'GLM-4.5-Flash', value: 'GLM-4.5-Flash' },
          ]"
        />
        <div class="more-models-btn" @click="goToMoreModels">更多AI模型</div>
      </div>
    </template>
    
    <template v-if="step === 'manual-outline'">
      <textarea 
        class="manual-textarea" 
        v-model="manualOutline" 
        placeholder="请输入您的大纲内容，支持Markdown格式..."
      ></textarea>
      <div class="btns">
        <Button class="btn" type="primary" @click="useManualOutline()">使用此大纲</Button>
        <Button class="btn" @click="step = 'setup'">返回</Button>
      </div>
    </template>
    
    <div class="preview" v-if="step === 'outline'">
      <pre ref="outlineRef" v-if="outlineCreating">{{ outline }}</pre>
       <div class="outline-view" v-else>
         <OutlineEditor v-model:value="outline" />
       </div>
      <div class="btns" v-if="!outlineCreating">
        <Button class="btn" type="primary" @click="step = 'template'">选择模板</Button>
        <Button class="btn" @click="outline = ''; step = 'setup'">返回重新生成</Button>
      </div>
    </div>
    <div class="select-template" v-if="step === 'template'">
      <div class="templates">
        <div class="template" 
          :class="{ 'selected': selectedTemplate === template.id }" 
          v-for="template in templates" 
          :key="template.id" 
          @click="selectedTemplate = template.id"
        >
          <img :src="template.cover" :alt="template.name">
        </div>
      </div>
      <div class="btns">
        <Button class="btn" type="primary" @click="createPPT()">生成</Button>
        <Button class="btn" @click="step = 'outline'">返回大纲</Button>
      </div>
    </div>

    <FullscreenSpin :loading="loading" tip="AI生成中，请耐心等待 ..." />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import api from '@/services'
import useAIPPT from '@/hooks/useAIPPT'
import type { AIPPTSlide } from '@/types/AIPPT'
import type { Slide } from '@/types/slides'
import message from '@/utils/message'
import { useMainStore, useSlidesStore } from '@/store'
import Input from '@/components/Input.vue'
import Button from '@/components/Button.vue'
import Select from '@/components/Select.vue'
import FullscreenSpin from '@/components/FullscreenSpin.vue'
import OutlineEditor from '@/components/OutlineEditor.vue'

const mainStore = useMainStore()
const { templates } = storeToRefs(useSlidesStore())
const { AIPPT, getMdContent } = useAIPPT()

const language = ref<'中文' | '英文'>('中文')
const keyword = ref('')
const outline = ref('')
const manualOutline = ref(`
# AI的出现对未来就业环境的影响

## 就业结构转变

###  新兴职业涌现

####  AI相关领域
-  AI算法工程师
-  AI数据科学家
-  AI伦理顾问
####  衍生服务领域
-  AI训练师
-  AI产品经理
-  AI内容创作者

###  传统职业转型

####  自动化替代
-  制造业工人
-  客服人员
-  数据录入员
####  技能升级
-  医生借助AI辅助诊断
-  教师利用AI个性化教学
-  设计师使用AI提升设计效率


##  就业技能需求变化

###  技术能力

####  编程与数据分析
-  掌握Python、R等编程语言
-  具备数据分析和处理能力

####  AI工具使用
-  熟练操作AI相关软件和平台

###  软技能

####  创造力与批判性思维
-  提出创新性解决方案
-  评估AI结果的可靠性

####  沟通与协作
-  跨领域沟通合作
-  人机协同工作


##  就业市场挑战

###  技能差距

####  人才供需失衡
-  AI人才短缺
-  传统行业人才技能过时

###  公平与伦理

####  算法歧视
-  AI算法可能存在偏见
####  就业机会分配
-  AI带来的自动化可能加剧贫富差距


##  应对策略

###  个人层面

####  持续学习
-  学习新技能，适应新职业
####  职业规划
-  选择AI难以替代的职业方向

###  社会层面

####  教育改革
-  培养适应未来需求的人才
####  政策支持
-  提供技能培训和就业指导
-  建立健全的AI伦理规范
`)
const selectedTemplate = ref('template_1')
const loading = ref(false)
const outlineCreating = ref(false)
const outlineRef = ref<HTMLElement>()
const inputRef = ref<InstanceType<typeof Input>>()
const step = ref<'setup' | 'outline' | 'template' | 'manual-outline'>('setup')
const model = ref('GLM-4.5-Flash')

const recommends = ref([
  '大学生职业生涯规划',
  '公司年会策划方案',
  '大数据如何改变世界',
  '餐饮市场调查与研究',
  'AIGC在教育领域的应用',
  '5G技术如何改变我们的生活',
  '社交媒体与品牌营销',
  '年度工作总结与展望',
  '区块链技术及其应用',
]) 

onMounted(() => {
  setTimeout(() => {
    inputRef.value!.focus()
  }, 500)
})

const setKeyword = (value: string) => {
  keyword.value = value
  inputRef.value!.focus()
}

const useManualOutline = () => {
  if (!manualOutline.value.trim()) {
    return message.error('请输入大纲内容')
  }
  
  outline.value = manualOutline.value.trim()
  step.value = 'outline'
  outlineCreating.value = false
}

const createOutline = async () => {
  if (!keyword.value) return message.error('请先输入PPT主题')

  loading.value = true
  outlineCreating.value = true

  const stream = await api.AIPPT_Outline(keyword.value, language.value, model.value)

  loading.value = false
  step.value = 'outline'

  const reader: ReadableStreamDefaultReader = stream.body.getReader()
  const decoder = new TextDecoder('utf-8')

  const readStream = () => {
    reader.read().then(({ done, value }) => {
      if (done) {
        outline.value = getMdContent(outline.value)
        outlineCreating.value = false
        return
      }

      const chunk = decoder.decode(value, { stream: true })
      outline.value += chunk

      if (outlineRef.value) {
        outlineRef.value.scrollTop = outlineRef.value.scrollHeight + 20
      }

      readStream()
    })
  }
  readStream()
}

const createPPT = async () => {
  loading.value = true

  const stream = await api.AIPPT(outline.value, language.value, 'GLM-4.5-Flash')
  const templateSlides: Slide[] = await api.getFileData(selectedTemplate.value).then(ret => ret.slides)

  const reader: ReadableStreamDefaultReader = stream.body.getReader()
  const decoder = new TextDecoder('utf-8')

  const readStream = () => {
    reader.read().then(({ done, value }) => {
      if (done) {
        loading.value = false
        mainStore.setAIPPTDialogState(false)
        return
      }

      const chunk = decoder.decode(value, { stream: true })
      try {
        const slide: AIPPTSlide = JSON.parse(chunk)
        AIPPT(templateSlides, [slide])
      }
      catch (err) {
        // eslint-disable-next-line
        console.error(err)
      }

      readStream()
    })
  }
  readStream()
}

const goToMoreModels = () => {
  window.open('https://tools.cmdragon.cn/zh/apps/chat-mindmap', '_blank')
}
</script>

<style lang="scss" scoped>
.aippt-dialog {
  margin: -20px;
  padding: 30px;
}
.header {
  margin-bottom: 12px;

  .title {
    font-weight: 700;
    font-size: 20px;
    margin-right: 8px;
    background: linear-gradient(270deg, #d897fd, #33bcfc);
    background-clip: text;
    color: transparent;
    vertical-align: text-bottom;
    line-height: 1.1;
  }
  .subtite {
    color: #888;
    font-size: 12px;
  }
}
.manual-textarea {
  width: 100%;
  height: 400px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: $borderRadius;
  resize: none;
  font-family: monospace;
  margin-bottom: 15px;
}
.preview {
  pre {
    max-height: 450px;
    padding: 10px;
    margin-bottom: 15px;
    background-color: #f1f1f1;
    overflow: auto;
  }
  .outline-view {
    max-height: 450px;
    padding: 10px;
    margin-bottom: 15px;
    background-color: #f1f1f1;
    overflow: auto;
  }
  .btns {
    display: flex;
    justify-content: center;
    align-items: center;

    .btn {
      width: 120px;
      margin: 0 5px;
    }
  }
}
.select-template {
  .templates {
    display: flex;
    margin-bottom: 10px;
    @include flex-grid-layout();
  
    .template {
      border: 2px solid $borderColor;
      border-radius: $borderRadius;
      width: 304px;
      height: 172.75px;
      margin-bottom: 12px;

      &:not(:nth-child(2n)) {
        margin-right: 12px;
      }

      &.selected {
        border-color: $themeColor;
      }
  
      img {
        width: 100%;
      }
    }
  }
  .btns {
    display: flex;
    justify-content: center;
    align-items: center;

    .btn {
      width: 120px;
      margin: 0 5px;
    }
  }
}
.btns {
  display: flex;
  justify-content: center;
  align-items: center;

  .btn {
    width: 120px;
    margin: 0 5px;
  }
}
.configs {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;

  .items {
    display: flex;
  }
  .item {
    margin-right: 5px;
  }
}
.recommends {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;

  .recommend {
    font-size: 12px;
    background-color: #f1f1f1;
    border-radius: $borderRadius;
    padding: 3px 5px;
    margin-right: 5px;
    margin-top: 5px;
    cursor: pointer;

    &:hover {
      color: $themeColor;
    }
  }
}
.model-selector {
  margin-top: 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
}
.count {
  font-size: 12px;
  color: #999;
  margin-right: 10px;
}
.language {
  font-size: 12px;
  margin-right: 10px;
  color: $themeColor;
  cursor: pointer;
}
.submit {
  height: 20px;
  font-size: 12px;
  background-color: $themeColor;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 5px;
  border-radius: $borderRadius;
  cursor: pointer;
  margin-left: 5px;

  &:hover {
    background-color: $themeHoverColor;
  }

  .icon {
    font-size: 15px;
    margin-right: 3px;
  }
  
  &.manual-btn {
    background-color: #67c23a;
    
    &:hover {
      background-color: #85ce61;
    }
  }
}
.more-models-btn {
  margin-left: 10px;
  font-size: 12px;
  color: #fff;
  background-color: #409eff;
  padding: 2px 8px;
  border-radius: $borderRadius;
  cursor: pointer;
  
  &:hover {
    background-color: #66b1ff;
  }
}
</style>