<template>
  <div class="home">
    <el-card class="profile-card">
      <div class="profile">
        <el-avatar :size="96" :src="avatar" />
        <h1>Cimk3</h1>
        <p class="slogan">Hello World</p>
        <p class="desc">I am a student</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import avatar from '@/assets/avatar.jpg'
</script>
