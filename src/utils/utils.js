/**
 *
 * @param {number} index
 * @returns {string}
 * @example
 * prefixedIndex(1) // '001'
 * prefixedIndex(45) // '045'
 * prefixedIndex(123) // '123'
 */
export const prefixedIndex = (index = '') => {
	return index.toString().padStart(3, '0')
}

/**
 * extracts videoId from youtube url
 * @param {string} url
 */
const getYoutubeId = url => {
	var id = ''
	url = url
		.replace(/(>|<)/gi, '')
		.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
	if (url[2] !== undefined) {
		id = url[2].split(/[^0-9a-z_\-]/i)
		id = id[0]
	} else {
		id = url
	}
	return id
}

/**
 * Checks is url from youtube or not
 * @param {string} url
 */
export const isYoutube = (url = '') => {
	return Boolean(
		url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)
	)
}

export const fetchYoutubeVideoByUrl = async url => {
	const youtubeId = getYoutubeId(url)
	let response = null
	try {
		response = await fetch(
			`https://direct-link.vercel.app/api/video/${youtubeId}`,
			//http://192.168.0.189:3000
			{
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				}
			}
		)
		response = await response.json()
	} catch (err) {
		console.log('TRY/CATCH ERROR', err)
	}
	return response
}

export const splitMarkdownIntoPartsByTemplate = (text, template) => {
	const matches = [...text.matchAll(template)]
	if (!matches) return [{ content: text }]

	const splitedParts = matches.map((elem, index, array) => {
		const nextElem = array[index + 1] || {}
		const nextIndex = nextElem.index || text.length
		const [headerText, title = '', , typeString = ''] = elem
		const [type, ...params] = typeString.split('|').map(elem => elem.trim())
		const { index: curIndex, input } = elem
		const content = input
			.slice(curIndex, nextIndex)
			.replace(headerText, '')
			.trim()
		return {
			title,
			type,
			params,
			content
		}
	})

	const { index: zeroIndex = 0 } = matches[0] || {}
	if (zeroIndex > 0) {
		//we have some data before first header template
		const introText = text.slice(0, zeroIndex)
		splitedParts.unshift({ introText })
	}
	return splitedParts
}

/**
 * checks is paragraph text is yaml params or not
 * if not - returns null
 * if yes - returns object of params
 *
 * @param {string} paragraphText
 */
export const yamlParams = paragraphText => {
	const lines = paragraphText.trim().split('\n')
	const matches = [...paragraphText.matchAll(/^(.+?):\s*(.+?)$/gm)]
	if (!matches) return null
	if (matches.length !== lines.length) return null

	const yamlParams = matches.reduce((prev, item) => {
		const [, key, value] = item
		return { ...prev, [key]: value }
	}, {})

	return yamlParams
}
