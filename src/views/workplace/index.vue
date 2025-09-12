<script setup lang="js">
import { defineAsyncComponent, ref } from 'vue';
import {
  Avatar as AAvatar,
  Divider as ADivider,
  Row as ARow,
  Col as ACol,
  Card as ACard,
  CardGrid as ACardGrid,
  Button as AButton,
  List as AList,
  ListItem as AListItem,
  ListItemMeta as AListItemMeta,
} from 'ant-design-vue';
import VIcon from '@src/components/icon/icon.vue';
import AvatarImg from '@src/assets/imgs/avatar.jpg';

const ExponentChart = defineAsyncComponent(() => import('./exponent-chart.vue'));

const dynamicData = ref([
  {
    userName: '张三',
    group: '科学搬砖组',
    action: '新建项目',
    task: '六月迭代',
  },
  {
    userName: '李四',
    group: '中二少女团',
    action: '更新至已发布状态',
    task: '',
  },
  {
    userName: '王五',
    group: '程序员日常',
    action: '发布了',
    task: '留言',
  },
  {
    userName: '赵六',
    group: '高逼格设计天团',
    action: '新建项目',
    task: '品牌迭代',
  },
  {
    userName: '钱七',
    group: '高逼格设计天团',
    action: '更新至已发布状态',
    task: '',
  },
  {
    userName: '孙八',
    group: '中二少女团',
    action: '发布了',
    task: '留言',
  },
]);
</script>

<template>
  <div class="p-4">
    <div class="text-xl font-semibold">工作台</div>
    <div class="py-4">
      <a-row :gutter="[16, 16]">
        <a-col :xl="14" :lg="24">
          <div class="flex items-center h-16">
            <div class="pr-6 flex-none">
              <a-avatar shape="circle" :size="64" :src="AvatarImg"></a-avatar>
            </div>
            <div class="flex-grow overflow-auto">
              <div class="text-xl font-medium pb-3">早安，靓仔，祝你开心每一天！</div>
              <div class="text-sm text-text-secondary truncate w-full">
                交互专家 | 某某某事业群－某某平台部－某某技术部－UED
              </div>
            </div>
          </div>
        </a-col>
        <a-col :xl="10" :lg="24">
          <div class="h-16 flex items-center justify-end overflow-hidden max-xl:justify-start">
            <div class="px-8 max-xl:pl-0">
              <div class="text-sm pb-1 text-text-tertiary">项目数</div>
              <div class="text-right text-2xl">56</div>
            </div>
            <a-divider type="vertical" style="height: 40px" />
            <div class="px-8">
              <div class="text-sm pb-1 text-text-tertiary">团队内排名</div>
              <div class="text-right text-2xl">8 / 24</div>
            </div>
            <a-divider type="vertical" style="height: 40px" />
            <div class="pl-8">
              <div class="text-sm pb-1 text-text-tertiary">项目访问</div>
              <div class="text-right text-2xl">2,223</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
    <a-row :gutter="16">
      <a-col :xl="16" :lg="24">
        <div class="pb-4">
          <a-card title="进行中的项目" :bordered="false">
            <template #extra>
              <a-button type="link"> 全部项目</a-button>
            </template>
            <a-card-grid style="width: calc(100% / 3)">
              <div class="pb-2">
                <div class="h-6 flex items-center">
                  <a-avatar shape="circle" :size="24">
                    <template #icon>
                      <v-icon class="pt-1" name="ant-design-icon-desktop-outlined"></v-icon>
                    </template>
                  </a-avatar>
                  <div class="pl-3 text-sm font-semibold">项目 A</div>
                </div>
              </div>
              <div class="h-11 text-sm pb-2 text-text-secondary overflow-hidden">
                那是一种内在的东西，他们到达不了，也无法触及的
              </div>
              <div class="flex justify-between w-full text-sm">
                <span class="text-text-tertiary cursor-pointer hover:text-primary">科学搬砖组</span>
                <span class="text-text-quaternary">几秒前</span>
              </div>
            </a-card-grid>
            <a-card-grid style="width: calc(100% / 3)">
              <div class="pb-2">
                <div class="h-6 flex items-center">
                  <a-avatar shape="circle" :size="24">
                    <template #icon>
                      <v-icon class="pt-1" name="ant-design-icon-desktop-outlined"></v-icon>
                    </template>
                  </a-avatar>
                  <div class="pl-3 text-sm font-semibold">项目 B</div>
                </div>
              </div>
              <div class="h-11 text-sm pb-2 text-text-secondary overflow-hidden">
                希望是一个好东西，也许是最好的，好东西是不会消亡的
              </div>
              <div class="flex justify-between w-full text-sm">
                <span class="text-text-tertiary cursor-pointer hover:text-text-primary"
                  >全组都是吴彦祖</span
                >
                <span class="text-text-text-quaternary">8 年前</span>
              </div>
            </a-card-grid>
            <a-card-grid style="width: calc(100% / 3)">
              <div class="pb-2">
                <div class="h-6 flex items-center">
                  <a-avatar shape="circle" :size="24">
                    <template #icon>
                      <v-icon class="pt-1" name="ant-design-icon-desktop-outlined"></v-icon>
                    </template>
                  </a-avatar>
                  <div class="pl-3 text-sm font-semibold">项目 C</div>
                </div>
              </div>
              <div class="h-11 text-sm pb-2 text-text-secondary overflow-hidden">
                城镇中有那么多的酒馆，她却偏偏走进了我的酒馆
              </div>
              <div class="flex justify-between w-full text-sm">
                <span class="text-text-tertiary cursor-pointer hover:text-text-primary"
                  >中二少女团</span
                >
                <span class="text-text-text-quaternary">几秒前</span>
              </div>
            </a-card-grid>
            <a-card-grid style="width: calc(100% / 3)">
              <div class="pb-2">
                <div class="h-6 flex items-center">
                  <a-avatar shape="circle" :size="24">
                    <template #icon>
                      <v-icon class="pt-1" name="ant-design-icon-desktop-outlined"></v-icon>
                    </template>
                  </a-avatar>
                  <div class="pl-3 text-sm font-semibold">项目 D</div>
                </div>
              </div>
              <div class="h-11 text-sm pb-2 text-text-secondary overflow-hidden">
                那时候我只会想自己想要什么，从不想自己拥有什么
              </div>
              <div class="flex justify-between w-full text-sm">
                <span class="text-text-tertiary cursor-pointer hover:text-text-primary"
                  >程序员日常</span
                >
                <span class="text-text-text-quaternary">8 年前</span>
              </div>
            </a-card-grid>
            <a-card-grid style="width: calc(100% / 3)">
              <div class="pb-2">
                <div class="h-6 flex items-center">
                  <a-avatar shape="circle" :size="24">
                    <template #icon>
                      <v-icon class="pt-1" name="ant-design-icon-desktop-outlined"></v-icon>
                    </template>
                  </a-avatar>
                  <div class="pl-3 text-sm font-semibold">项目 E</div>
                </div>
              </div>
              <div class="h-11 text-sm pb-2 text-text-secondary overflow-hidden">凛冬将至</div>
              <div class="flex justify-between w-full text-sm">
                <span class="text-text-tertiary cursor-pointer hover:text-text-primary"
                  >高逼格设计天团</span
                >
                <span class="text-text-text-quaternary">8 年前</span>
              </div>
            </a-card-grid>
            <a-card-grid style="width: calc(100% / 3)">
              <div class="pb-2">
                <div class="h-6 flex items-center">
                  <a-avatar shape="circle" :size="24">
                    <template #icon>
                      <v-icon class="pt-1" name="ant-design-icon-desktop-outlined"></v-icon>
                    </template>
                  </a-avatar>
                  <div class="pl-3 text-sm font-semibold">项目 F</div>
                </div>
              </div>
              <div class="h-11 text-sm pb-2 text-text-secondary overflow-hidden">
                生命就像一盒巧克力，结果往往出人意料
              </div>
              <div class="flex justify-between w-full text-sm">
                <span class="text-text-tertiary cursor-pointer hover:text-text-primary"
                  >骗你来学计算机</span
                >
                <span class="text-text-text-quaternary">8 年前</span>
              </div>
            </a-card-grid>
          </a-card>
        </div>
        <a-card title="动态" :bordered="false" :body-style="{ padding: 0 }">
          <a-list item-layout="horizontal" :data-source="dynamicData">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta description="几秒前">
                  <template #title>
                    <a>{{ item.userName }}</a>
                    <span class="px-1 font-normal">在</span>
                    <span>{{ item.projectName }}</span>
                    <span class="text-primary-color hover:text-info-hover cursor-pointer">{{
                      item.group
                    }}</span>
                    <span class="px-1 font-normal">{{ item.action }}</span>
                    <span class="text-primary-color hover:text-info-hover cursor-pointer">{{
                      item.task
                    }}</span>
                  </template>
                  <template #avatar>
                    <a-avatar>图</a-avatar>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xl="8" :lg="24">
        <div class="pb-4">
          <a-card title="快速开始 / 便捷导航" :bordered="false">
            <a-button type="primary" :ghost="true" size="small">
              <div class="flex items-center">
                <v-icon name="ant-design-icon-plus-outlined"></v-icon>
                <span>添加</span>
              </div>
            </a-button>
          </a-card>
        </div>
        <div class="pb-4">
          <a-card title="XX 指数" :bordered="false">
            <div class="h-86">
              <exponent-chart></exponent-chart>
            </div>
          </a-card>
        </div>
        <div class="pb-4">
          <a-card title="团队" :bordered="false">
            <a-row :gutter="[16, 16]">
              <a-col :span="12">
                <div class="flex items-center">
                  <a-avatar>图</a-avatar>
                  <span class="pl-4 cursor-pointer hover:text-text-primary">科学搬砖组</span>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="flex items-center">
                  <a-avatar>图</a-avatar>
                  <span class="pl-4 cursor-pointer hover:text-text-primary">全组都是吴彦祖</span>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="flex items-center">
                  <a-avatar>图</a-avatar>
                  <span class="pl-4 cursor-pointer hover:text-text-primary">中二少女团</span>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="flex items-center">
                  <a-avatar>图</a-avatar>
                  <span class="pl-4 cursor-pointer hover:text-text-primary">程序员日常</span>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="flex items-center">
                  <a-avatar>图</a-avatar>
                  <span class="pl-4 cursor-pointer hover:text-text-primary">高逼格设计天团</span>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="flex items-center">
                  <a-avatar>图</a-avatar>
                  <span class="pl-4 cursor-pointer hover:text-text-primary">骗你来学计算机</span>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
