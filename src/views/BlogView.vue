<template>
    <div class="blog">
        <el-timeline>
            <el-timeline-item v-for="post in posts" :key="post.id" :timestamp="post.data" placement="top">
                <el-card shadow="hover">
                    <h3>{{ post.title }}</h3>
                    <p>{{ post.summary }}</p>
                </el-card>
            </el-timeline-item>
        </el-timeline>
    </div>
</template>
    
<script setup>
import { ref } from 'vue';


const posts=ref([
    {
        id:1,
        title:'文章标题',
        data:'2026-08-01',
        summary:'文章摘要'
    },
    //后续文章
])
</script>