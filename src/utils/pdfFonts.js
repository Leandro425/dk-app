import { Font } from '@react-pdf/renderer'
import robotoRegular from '../assets/fonts/roboto/Roboto-Regular.ttf'
import robotoBold from '../assets/fonts/roboto/Roboto-Bold.ttf'

export const PDF_FONT_FAMILY = 'Roboto'

let registered = false

/**
 * Register the fonts used by all generated PDFs. Safe to call from every document module.
 * Roboto covers Latin Extended and Cyrillic, which the built-in PDF fonts do not (pl, ro, bg).
 */
export const registerPdfFonts = () => {
    if (registered) return
    Font.register({
        family: PDF_FONT_FAMILY,
        fonts: [
            { src: robotoRegular, fontWeight: 'normal' },
            { src: robotoBold, fontWeight: 'bold' },
        ],
    })
    Font.registerHyphenationCallback((word) => [word])
    registered = true
}
