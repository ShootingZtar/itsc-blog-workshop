<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

interface BlogsQuery {
  blogs: {
    blogId: number
    title: string
    description: string
    thumbnailUrl: string
    __typename: string
  }[]
}

const { result: blogsResult } = useQuery<BlogsQuery>(gql`
  query GetBlog {
    blogs (where: { isDeleted: { eq: false } } ) {
      blogId
      title
      description
      thumbnailUrl
    }
  }`,
  null,
  { fetchPolicy: 'no-cache' }
)
</script>

<template>
  <div class="flex justify-end mb-8">
    <button class="bg-[#198754] text-white rounded-lg p-4">
      <span>Create New Blog</span>
    </button>
  </div>
  <div>
    <div v-for="blog in blogsResult?.blogs" :key="blog.blogId" class="card mb-8">
      <div class="w-full rounded-t-3xl bg-[#FF9E22] p-4 font-bold">{{ blog.title }}</div>
      <div class="grid grid-cols-2 gap-4 w-full rounded-b-3xl bg-[#FFDDB0] p-4">
        <div :style="`background-image: url(${blog.thumbnailUrl});`"
          class="rounded-3xl bg-cover bg-center h-40 sm:h-56 md:h-72"></div>
        <div class="flex flex-col">
          <div class="grow">{{ blog.description }}</div>
          <div class="flex justify-end">
            <button class="bg-[#4527A0] text-white rounded-lg py-4 ml-4 w-[160px]">
              <span>Edit</span>
            </button>
            <RouterLink :to="{ name: 'blog-detail', params: { blogId: blog.blogId } }">
              <button class="bg-[#2962FF] text-white rounded-lg py-4 ml-4 w-[160px]">
                <span>Read More</span>
              </button>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>