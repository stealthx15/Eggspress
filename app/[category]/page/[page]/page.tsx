import getFrontmatter from '../../../_components/getFrontmatter'
import { createSlug, getEggspressSettings } from '../../../utils'
import PostCard from '../../../_components/PostCard'
import PageSidebar from '../../../_components/PageSidebar'
import PaginationCard from '../../../_components/PaginationCard'


export async function generateStaticParams() {
  const postFrontmatter = await getFrontmatter('posts')
  const appearanceSettings = await getEggspressSettings('appearance')

  const categoryMap: Record<any, any> = {}
  postFrontmatter.map(post => {
    categoryMap[createSlug(post.category)] = 1
  })
  
  let params: {category: string, page: string}[] = []

  Object.keys(categoryMap).map(categorySlug => {
    const postCount = postFrontmatter.filter(post => createSlug(post.category) === categorySlug).length
    const pageCount = Math.ceil(postCount / (appearanceSettings.numberOfPostsPerPage || 8))

    for (let i = 0; i < pageCount; i ++) {
      params.push({category: categorySlug, page: (+i + 1).toString()})
    }
  })

  return params
}


export async function generateMetadata({ params }: { params: { category: string, page: string}}) {
  const blogSettings = await getEggspressSettings('metadata')
  const { category, page } = params
  
  const pageNumber = parseInt(page)
  const postFrontmatter = await getFrontmatter('posts')

  const categoryFrontmatter = await getFrontmatter('categories')
  const categoryData = categoryFrontmatter.filter(fm => fm.slug === category)[0]
  const filteredPosts = postFrontmatter.filter(post => createSlug(post.category) === category)

  let categoryName = filteredPosts && filteredPosts.length ? filteredPosts[0].category : decodeURI(category)
  if (categoryData) {
    categoryName = categoryData.title
  }

  categoryName = categoryName || category
    
  return {
    title: `Page ${page} - ${categoryName}`
  }
}

export default async function BlogPage({ params }: { params: { category: string, page: string } }) {
  const { category, page } = params
  const pageNumber = parseInt(page)
  const postFrontmatter = await getFrontmatter('posts')
  const appearanceSettings = await getEggspressSettings('appearance')
  const numPostsPerPage = appearanceSettings.numberOfPostsPerPage || 8
  
  const filteredPosts = postFrontmatter.filter(post => createSlug(post.category) === category)

  const endIndex = pageNumber * numPostsPerPage > filteredPosts.length ? filteredPosts.length : pageNumber * numPostsPerPage
  const startIndex = pageNumber * numPostsPerPage - numPostsPerPage > filteredPosts.length ? endIndex - numPostsPerPage : pageNumber * numPostsPerPage - numPostsPerPage

  const categoryFrontmatter = await getFrontmatter('categories')
  const categoryData = categoryFrontmatter.filter(fm => fm.slug === category)[0]

  let categoryName = filteredPosts && filteredPosts.length ? filteredPosts[0].category : decodeURI(category)
  if (categoryData) {
    categoryName = categoryData.title
  }

  categoryName = categoryName || category

  return (
    <main className="flex flex-wrap">
      <div className={`hero bleed-${appearanceSettings.colorLightPrimary} dark:bleed-${appearanceSettings.colorDarkPrimary}`}>
        <h1 className="text-5xl font-bold mb-4 -ml-0.5">{categoryName} <span className="text-gray-400 dark:text-gray-500">{`//`} Page {page}</span></h1>      
        <div className="font-normal">Displaying {startIndex + 1} - {endIndex} of {filteredPosts.length}</div>
      </div>
      <div className="flex justify-between w-full">
        <div className='lg:max-w-prose'>
          {filteredPosts.slice(startIndex, endIndex).map((frontmatter, index) => 
            <PostCard key={`${frontmatter.slug}-${index}`} post={frontmatter}></PostCard>
          )}
        </div>
        <div>
          <PageSidebar slug="index"></PageSidebar>
        </div>
      </div>
      <PaginationCard currentPage={pageNumber} startIndex={startIndex} endIndex={endIndex} postCount={filteredPosts.length}></PaginationCard>
    </main>
  )
}
