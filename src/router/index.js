import Vue from 'vue'
import VueRouter from 'vue-router'

import index from 'views/ebook/index'
import EbookReader from 'components/ebook/EbookReader'

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		redirect: '/ebook'
	},
  {
    path: '/ebook',
    name: 'index',
    component: index,
    children: [
    	{
    		path: ':fileName',
    		component: EbookReader
    	}
    ]
  },
]

const router = new VueRouter({
  routes
})

export default router
