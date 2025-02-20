import { __, sprintf } from "@wordpress/i18n";
import { isUndefined, merge } from "lodash-es";

import Assessment from "../assessment";
import { createAnchorOpeningTag } from "../../../helpers";
import AssessmentResult from "../../../values/AssessmentResult";

/**
 * Assessment to check whether you're linking to a different page with the keyword from this page.
 */
class TextCompetingLinksAssessment extends Assessment {
	/**
	 * Sets the identifier and the config.
	 *
	 * @param {Object} [config] The configuration to use.
	 * @param {number} [config.parameters.recommendedMaximum] The recommended maximum number of links using the same keyword as this paper.
	 * @param {string} [config.scores.bad] The score to return if there are more links with the same keyword than the recommended maximum.
	 * @param {string} [config.url] The URL to the relevant article on Yoast.com.
	 *
	 * @returns {void}
	 */
	constructor( config = {} ) {
		super();

		const defaultConfig = {
			parameters: {
				recommendedMaximum: 0,
			},
			scores: {
				bad: 2,
			},
			urlTitle: createAnchorOpeningTag( "https://yoa.st/34l" ),
			urlCallToAction: createAnchorOpeningTag( "https://yoa.st/34m" ),
		};

		this.identifier = "textCompetingLinks";
		this._config = merge( defaultConfig, config );
	}

	/**
	 * Runs the linkCount module, based on this returns an assessment result with score.
	 *
	 * @param {Paper}       paper       The paper to use for the assessment.
	 * @param {Researcher}  researcher  The researcher used for calling research.
	 *
	 * @returns {Object} The AssessmentResult.
	 */
	getResult( paper, researcher ) {
		const assessmentResult = new AssessmentResult();

		this.totalAnchorsWithKeyphrase = researcher.getResearch( "getAnchorsWithKeyphrase" ).anchorsWithKeyphraseCount;

		const calculatedResult = this.calculateResult();

		if ( isUndefined( calculatedResult ) ) {
			return assessmentResult;
		}

		assessmentResult.setScore( calculatedResult.score );
		assessmentResult.setText( calculatedResult.resultText );
		assessmentResult.setHasMarks( false );

		return assessmentResult;
	}

	/**
	 * Determines if the assessment is applicable to the paper.
	 *
	 * @param {Paper}       paper       The paper to check
	 *
	 * @returns {boolean} Whether the paper has text and a keyword
	 */
	isApplicable( paper ) {
		return paper.hasText() && paper.hasKeyword();
	}

	/**
	 * Returns a result based on the number of links.
	 *
	 * @returns {Object} ResultObject with score and text.
	 */
	calculateResult() {
		if ( this.totalAnchorsWithKeyphrase > this._config.parameters.recommendedMaximum ) {
			return {
				score: this._config.scores.bad,
				resultText: sprintf(
					/* translators:  %1$s and %2$s expand to links on yoast.com, %3$s expands to the anchor end tag */
					__(
						"%1$sLink keyphrase%3$s: You're linking to another page with the words you want this page to rank for. %2$sDon't do that%3$s!",
						"wordpress-seo"
					),
					this._config.urlTitle,
					this._config.urlCallToAction,
					"</a>"
				),
			};
		}
	}
}

export default TextCompetingLinksAssessment;
