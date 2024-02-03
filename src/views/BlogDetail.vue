<script setup lang="ts">
import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs'

interface BlogQuery {
  blogs: {
    blogId: number
    title: string
    description: string
    thumbnailUrl: string
    createdDate: string
    authorName: string
    comments:
    {
      commentId: number
      message: string
      __typename: string
    }[]
    __typename: string
  }[]
}

const route = useRoute()
const router = useRouter()
const blogId = route.params['blogId'] ? Number(route.params['blogId']) : undefined

const isModalOpen = ref(false)

const { result: blogsResult } = useQuery<BlogQuery>(gql`
  query GetBlog {
    blogs (where: { blogId: { eq: ${blogId} } } ) {
      blogId
      title
      description
      thumbnailUrl
      createdDate
      authorName
      comments {
        commentId
        message
      }
    }
  }`,
  null,
  { fetchPolicy: 'no-cache' }
)
const currentBlog = computed(() => blogsResult.value?.blogs[0])

const { mutate: deleteBlog, onDone: onDeleteDone } = useMutation(gql`
  mutation DeleteBlogById($blogId: Int!) {
    softDeleteBlogByBlogId(blogId: $blogId)
  }
`)

onDeleteDone(() => {
  router.push({ name: 'dashboard'})
})

function handleDeleteButtonClicked() {
  onToggleModal()
}

function confirmedDeleteBlog() {
  deleteBlog({ blogId })
}

function onToggleModal() {
  isModalOpen.value = !isModalOpen.value
}

function formatDate(dateString: string) {
  return dayjs(dateString).format('YYYY-MM-DD')
}

function isLast(index: number, arrayLength: number) {
  return index === arrayLength - 1
}

</script>

<template>
  <transition name="fade">
    <div v-if="isModalOpen" class="flex justify-center">
      <div @click="onToggleModal" class="fixed bg-black opacity-70 inset-0 z-0"></div>
      <div class="w-full max-w-lg p-3 fixed mx-auto my-auto rounded-xl shadow-lg bg-white">
        <div>
          <div class="text-center p-3 flex-auto justify-center leading-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 flex items-center text-[#D32F2F] mx-auto"
              viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd" />
            </svg>
            <h2 class="text-2xl font-bold py-4">Are you sure?</h2>
            <p class="text-md text-gray-500 px-8">
              Do you really want to delete this blog?
            </p>
          </div>
          <div class="p-3 mt-2 text-center space-x-4 md:block">
            <button
              class="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-md hover:shadow-lg hover:bg-gray-100">
              Close
            </button>
            <button @click="confirmedDeleteBlog"
              class="mb-2 md:mb-0 bg-[#D32F2F] border border-[#D32F2F] px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-md hover:shadow-lg">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <div v-if="currentBlog">
    <div class="card mb-8">
      <div class="w-full rounded-t-3xl bg-[#FF9E22] p-4 font-bold">{{ currentBlog.title }}</div>
      <div class="w-full rounded-b-3xl bg-[#FFDDB0] p-4">
        <div class="mb-4">
          <figure>
            <img :src="currentBlog.thumbnailUrl" class="w-full rounded-3xl">
          </figure>
        </div>
        <div class="mb-4">
          {{ currentBlog.description }}
        </div>
        <div class="my-24"></div>
        <div class="flex">
          <div class="flex flex-wrap content-center">
            <span class="font-bold mr-2">ปล่อยวันที่</span>
            <span class="mr-4"> {{ formatDate(currentBlog.createdDate) }} </span>
            <span class="font-bold mr-2">โดย</span>
            <span class="mr-4"> {{ currentBlog.authorName }} </span>
          </div>
          <div class="flex grow justify-end">
            <RouterLink :to="{ name: 'blog-update', params: { blogId: currentBlog.blogId } }">
              <button class="bg-[#4527A0] text-white rounded-lg py-2 ml-4 w-[160px]">
                <span class="font-bold">Edit</span>
              </button>
            </RouterLink>
            <button class="bg-[#D32F2F] text-white rounded-lg py-2 ml-4 w-[160px]" @click="handleDeleteButtonClicked">
              <span class="font-bold">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-8">
      <div class="w-full rounded-t-3xl bg-[#4527A0] text-white font-bold p-4">Comments</div>
      <div v-for="(comment, index) in currentBlog.comments" :key="comment.commentId" class="w-full bg-[#FFDDB0]"
        :class="{ 'rounded-b-3xl': isLast(index, currentBlog.comments.length) }">
        <div class="p-4">{{ comment.message }}</div>
        <hr v-if="!isLast(index, currentBlog.comments.length)" class="border-black">
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 500ms ease-out;
}
</style>