<script setup lang="ts">
import { useLazyQuery, useMutation } from '@vue/apollo-composable'
import dayjs from 'dayjs'
import gql from 'graphql-tag'
import { Form, Field, type SubmissionHandler, type GenericObject } from 'vee-validate'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface MutationAddBlogResult {
  data: {
    addBlog: {
      blogId: number
      __typename: string
    }
  }
}

interface MutationUpdateBlogResult {
  data: {
    updateBlog: {
      blogId: number
      __typename: string
    }
  }
}

interface MutationAddBlogVariable {
  requestBlogInput: RequestBlogInput
}

interface MutationUpdateBlogVariable {
  blogId: number
  requestBlogInput: RequestBlogInput
}

interface RequestBlogInput {
  title: string
  description: string
  createdDate: string
  authorName: string
  thumbnailUrl: string
  comments: string
}

interface QueryBlogEditDetail {
  blogs: {
    __typename: string
    title: string
    description: string
    createdDate: string
    authorName: string
    thumbnailUrl: string
    comments: {
      __typename: string
      message: string
    }[]
  }[]
}

const router = useRouter()

const route = useRoute()

const blogId = route.params['blogId'] ? parseInt(route.params['blogId'].toString(), 10) : null

const { mutate: mutateAddBlog, onDone: onDoneAddBlog } = useMutation<
  MutationAddBlogResult,
  MutationAddBlogVariable
>(gql`
  mutation AddBlog($requestBlogInput: RequestBlogInput) {
    addBlog(blogRequest: $requestBlogInput) {
      blogId
    }
  }
`)

const { mutate: mutateUpdateBlog, onDone: onDoneUpdateBlog } = useMutation<
  MutationUpdateBlogResult,
  MutationUpdateBlogVariable
>(gql`
  mutation UpdateBlogByBlogId($blogId: Int!, $requestBlogInput: RequestBlogInput) {
    updateBlogByBlogId(blogId: $blogId, blogRequest: $requestBlogInput) {
      blogId
    }
  }
`)

const { result, load } = useLazyQuery<QueryBlogEditDetail>(
  gql`
    query BlogEditDetail($blogId: Int) {
      blogs(where: { blogId: { eq: $blogId } }) {
        title
        description
        createdDate
        authorName
        thumbnailUrl
        comments {
          message
        }
      }
    }
  `,
  { blogId: blogId }
)

const isUpdateBlog = blogId !== null

if (isUpdateBlog) {
  load()
}

const comments = ref<string[]>([''])

const showForm = computed(() => !isUpdateBlog || result.value)

const submitButtonText = computed(() => (isUpdateBlog ? 'Update Blog' : 'Create Blog'))

const formInitialValues = computed(() => {
  if (!result.value) {
    return {}
  }

  const { __typename, ...restData } = result.value.blogs[0]

  return {
    ...restData,
    createdDate: dayjs(restData.createdDate).format('YYYY-MM-DD'),
    comments: restData.comments.map((data) => data.message)
  }
})

function onClickAddComment() {
  comments.value.push('')
}

const handleSubmit: SubmissionHandler<GenericObject, GenericObject, unknown> = (submitValue) => {
  const requestBlogInput = submitValue as RequestBlogInput

  const mapRequestBlogInput = {
    ...requestBlogInput,
    createdDate: dayjs(requestBlogInput.createdDate).toISOString()
  }

  if (isUpdateBlog) {
    mutateUpdateBlog({ blogId: blogId, requestBlogInput: mapRequestBlogInput })
  } else {
    mutateAddBlog({ requestBlogInput: mapRequestBlogInput })
  }
}

onDoneAddBlog(() => {
  router.push({ name: 'dashboard' })
})

onDoneUpdateBlog(() => {
  router.push({ name: 'dashboard' })
})
</script>

<template>
  <div class="container mx-auto p-8 flex justify-center">
    <Form
      v-if="showForm"
      :initial-values="formInitialValues"
      class="flex flex-col gap-4 items-center w-full max-w-xs"
      @submit="handleSubmit"
    >
      <div class="flex flex-col gap-2 w-full">
        <label class="font-bold" for="title">Title</label>
        <Field
          class="px-4 py-2 rounded-lg"
          name="title"
          id="title"
          placeholder="as Jame Bond 007"
        />
      </div>

      <div class="flex flex-col gap-2 w-full">
        <label class="font-bold" for="createdDate">Created Date</label>
        <Field
          class="px-4 py-2 rounded-lg"
          name="createdDate"
          id="createdDate"
          placeholder="2021-11-12"
          type="date"
        />
      </div>

      <div class="flex flex-col gap-2 w-full">
        <label class="font-bold" for="thumbnailUrl">Image URL</label>
        <Field
          class="px-4 py-2 rounded-lg"
          name="thumbnailUrl"
          id="thumbnailUrl"
          placeholder="as https://img.com/profile.png"
        />
      </div>

      <div class="flex flex-col gap-2 w-full">
        <label class="font-bold" for="authorName">Author Name</label>
        <Field
          class="px-4 py-2 rounded-lg"
          name="authorName"
          id="authorName"
          placeholder="as ชัยพงษ์"
        />
      </div>

      <div class="flex flex-col gap-2 w-full">
        <label class="font-bold" for="description">Description</label>
        <Field
          as="textarea"
          class="px-4 py-2 rounded-lg"
          name="description"
          id="description"
          placeholder="Write a message"
        />
      </div>

      <div class="flex flex-col gap-2 w-full relative">
        <Field
          v-for="(_, index) in comments"
          :key="index"
          class="px-4 py-2 rounded-lg"
          :name="`comments[${index}]`"
          placeholder="as ชัยพงษ์"
        />
        <button
          type="button"
          class="bg-[#198754] text-white rounded-lg p-4 absolute left-[336px] py-1 h-[40px] flex gap-2 items-center"
          @click="onClickAddComment()"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_183_571)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8ZM8.5 4.5C8.5 4.36739 8.44732 4.24021 8.35355 4.14645C8.25979 4.05268 8.13261 4 8 4C7.86739 4 7.74021 4.05268 7.64645 4.14645C7.55268 4.24021 7.5 4.36739 7.5 4.5V7.5H4.5C4.36739 7.5 4.24021 7.55268 4.14645 7.64645C4.05268 7.74021 4 7.86739 4 8C4 8.13261 4.05268 8.25979 4.14645 8.35355C4.24021 8.44732 4.36739 8.5 4.5 8.5H7.5V11.5C7.5 11.6326 7.55268 11.7598 7.64645 11.8536C7.74021 11.9473 7.86739 12 8 12C8.13261 12 8.25979 11.9473 8.35355 11.8536C8.44732 11.7598 8.5 11.6326 8.5 11.5V8.5H11.5C11.6326 8.5 11.7598 8.44732 11.8536 8.35355C11.9473 8.25979 12 8.13261 12 8C12 7.86739 11.9473 7.74021 11.8536 7.64645C11.7598 7.55268 11.6326 7.5 11.5 7.5H8.5V4.5Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_183_571">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span> Comment </span>
        </button>
      </div>

      <button class="bg-[#198754] text-white rounded-lg p-4" type="submit">
        {{ submitButtonText }}
      </button>
    </Form>
  </div>
</template>
