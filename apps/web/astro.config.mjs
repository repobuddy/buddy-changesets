import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

export default defineConfig({
	site: 'https://repobuddy.github.io',
	base: '/buddy-changesets',
	integrations: [
		starlight({
			title: 'Buddy Changesets',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/repobuddy/buddy-changesets' }],
			sidebar: [
				{ label: 'Guide', items: [{ label: 'Overview', link: '/' }, { label: 'Install', link: '/install/' }] },
				{
					label: 'Skills',
					items: [
						{ label: 'changesets', link: '/skills/changesets/' },
						{ label: 'init-changesets', link: '/skills/init-changesets/' },
						{ label: 'add-changeset', link: '/skills/add-changeset/' },
						{ label: 'review-changesets', link: '/skills/review-changesets/' },
					],
				},
			],
			editLink: { baseUrl: 'https://github.com/repobuddy/buddy-changesets/edit/main/apps/web/' },
		}),
	],
})
