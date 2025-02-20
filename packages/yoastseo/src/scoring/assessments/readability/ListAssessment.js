import { __, sprintf } from "@wordpress/i18n";
import { merge } from "lodash-es";

import Assessment from "../assessment";
import AssessmentResult from "../../../values/AssessmentResult";
import { createAnchorOpeningTag } from "../../../helpers";
import removeHtmlBlocks from "../../../languageProcessing/helpers/html/htmlParser";

/**
 * Represents the assessment that will look if the text has a list (only applicable for product pages).
 */
export default class ListAssessment extends Assessment {
	/**
	 * Sets the identifier and the config.
	 *
	 * @param {object} config The configuration to use.
	 *
	 * @returns {void}
	 */
	constructor( config = {} ) {
		super();

		const defaultConfig = {
			urlTitle: createAnchorOpeningTag( "https://yoa.st/shopify38" ),
			urlCallToAction: createAnchorOpeningTag( "https://yoa.st/shopify39" ),
			scores: {
				bad: 3,
				good: 9,
			},
		};

		this._config = merge( defaultConfig, config );

		this.identifier = "listsPresence";
	}

	/**
	 * Checks whether there is an ordered or unordered list in the text.
	 *
	 * @param {Paper}	paper	The paper object to get the text from.
	 *
	 * @returns {boolean} Whether there is a list in the paper text.
	 */
	findList( paper ) {
		const regex = /<[uo]l.*>[\s\S]*<\/[uo]l>/;
		let text = paper.getText();

		text = removeHtmlBlocks( text );

		return regex.test( text );
	}

	/**
	 * Execute the Assessment and return a result.
	 *
	 * @param {Paper}       paper       The Paper object to assess.
	 *
	 * @returns {AssessmentResult} The result of the assessment, containing both a score and a descriptive text.
	 */
	getResult( paper ) {
		this.textContainsList = this.findList( paper );

		const calculatedScore = this.calculateResult();

		const assessmentResult = new AssessmentResult();
		assessmentResult.setScore( calculatedScore.score );
		assessmentResult.setText( calculatedScore.resultText );

		return assessmentResult;
	}

	/**
	 * Checks whether the paper has text.
	 *
	 * @param {Paper}       paper       The paper to use for the assessment.
	 *
	 * @returns {boolean} True when there is text.
	 */
	isApplicable( paper ) {
		return this.hasEnoughContentForAssessment( paper );
	}

	/**
	 * Calculate the result based on the availability of lists in the text.
	 *
	 * @returns {Object} The calculated result.
	 */
	calculateResult() {
		// Text with at least one list.
		if ( this.textContainsList ) {
			return {
				score: this._config.scores.good,
				resultText: sprintf(
					/* translators: %1$s and %2$s expand to links on yoast.com, %3$s expands to the anchor end tag */
					__(
						"%1$sLists%2$s: There is at least one list on this page. Great!",
						"yoast-woo-seo"
					),
					this._config.urlTitle,
					"</a>"
				),
			};
		}

		// Text with no lists.
		return {
			score: this._config.scores.bad,
			resultText: sprintf(
				/* translators: %1$s expands to a link on yoast.com,
				 * %2$s expands to the anchor end tag. */
				__(
					"%1$sLists%3$s: No lists appear on this page. %2$sAdd at least one ordered or unordered list%3$s!",
					"yoast-woo-seo"
				),
				this._config.urlTitle,
				this._config.urlCallToAction,
				"</a>"
			),
		};
	}
}
