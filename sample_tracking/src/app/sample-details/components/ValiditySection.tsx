import React from "react";
import ValidityTag from "./ValidityTag";
import { type Sample } from "../../../old_components/utils";
import { useTranslation, Trans } from "react-i18next";

type Props = {
  selectedDoc: Sample;
};

const ValiditySection: React.FC<Props> = ({ selectedDoc }) => {
  const { t } = useTranslation();

  function parsePercentageFromString(value: string) {
    const floatValue = parseFloat(value);
    if (isNaN(floatValue)) return t("unknown");
    return (floatValue * 100).toFixed(2);
  }

  // Sample Processing Metadata
  var dateOfSampleProcessed = selectedDoc["created_on"];

  // Isoscape Metadata
  var referenceIsoscapeName = t("unknown");
  var referenceIsotopeCreationDate = t("unknown");
  referenceIsotopeCreationDate = t("unknown");
  var referenceIsotopePrecision = t("unknown");
  var referenceIsotopeRecall = t("unknown");
  var validityLabel = t("unknown");

  // T-Test Results
  var d18OCelSampleMean = t("unknown");
  var d18OCelSampleVariance = t("unknown");
  var d18OCelReferenceMean = t("unknown");
  var d18OCelReferenceVariance = t("unknown");
  var pValue = t("unknown");
  var threshold = t("unknown");
  var likelihoodSameDistributionsPct = t("unknown");

  var validityDetails = selectedDoc["validity_details"];
  if (validityDetails) {
    // Isoscape Metadata
    referenceIsoscapeName = validityDetails["reference_oxygen_isoscape_name"];
    referenceIsotopeCreationDate =
      validityDetails["reference_oxygen_isoscape_creation_date"];
    if (referenceIsotopeCreationDate) {
      const dateObj = new Date(referenceIsotopeCreationDate);
      referenceIsotopeCreationDate = dateObj.toISOString().split("T")[0];
    }
    var referenceIsotopePrecision = parsePercentageFromString(
      validityDetails["reference_oxygen_isoscape_precision"]
    );
    var referenceIsotopeRecall = parsePercentageFromString(
      validityDetails["reference_oxygen_isoscape_recall"]
    );

    // T-Test Results
    validityLabel = selectedDoc["validity"] || t("unknown");
    d18OCelSampleMean = validityDetails["d18O_cel_sample_mean"]?.toFixed(5);
    d18OCelSampleVariance =
      validityDetails["d18O_cel_sample_variance"]?.toFixed(5);
    d18OCelReferenceMean =
      validityDetails["d18O_cel_reference_mean"]?.toFixed(5);
    d18OCelReferenceVariance =
      validityDetails["d18O_cel_reference_variance"]?.toFixed(5);
    pValue = validityDetails["p_value"]?.toFixed(10);
    threshold = validityDetails["p_value_threshold"]?.toFixed(10);
    likelihoodSameDistributionsPct = (validityDetails["p_value"] * 100).toFixed(
      2
    );
  }

  return (
    <div className="details">
      <div className="section-title">{t("validity")}</div>
      <div>
        <ValidityTag
          validityLabel={validityLabel}
          isTrusted={false}
          city={selectedDoc["municipality"]}
          lat={selectedDoc["lat"]}
          lon={selectedDoc["lon"]}
        />
        {validityLabel === "Not Likely" && (
          <div className="samples-origin-pct">
            {t("pctSimilarSamplesStatedOrigin", {
              pct: referenceIsotopePrecision,
            })}
          </div>
        )}
      </div>
      <div className="detail-row">
        <div className="detail">
          <span className="detail-name">
            <Trans i18nKey="d18OCelSampleMean" t={t}>
              δ<sup>18</sup>O Cel sample mean
            </Trans>
          </span>
          <span className="detail-value">{d18OCelSampleMean}</span>
        </div>
        <div className="detail">
          <span className="detail-name">
            <Trans i18nKey="d18OCelSampleVariance" t={t}>
              δ<sup>18</sup>O Cel sample variance
            </Trans>
          </span>
          <span className="detail-value">{d18OCelSampleVariance}</span>
        </div>
      </div>
      <div className="detail-row">
        <div className="detail">
          <span className="detail-name">
            <Trans i18nKey="d18OCelReferenceMean" t={t}>
              δ<sup>18</sup>O Cel reference mean
            </Trans>
          </span>
          <span className="detail-value">{d18OCelReferenceMean}</span>
        </div>
        <div className="detail">
          <span className="detail-name">
            <Trans i18nKey="d18OCelReferenceVariance" t={t}>
              δ<sup>18</sup>O Cel reference variance
            </Trans>
          </span>
          <span className="detail-value">{d18OCelReferenceVariance}</span>
        </div>
      </div>
      <div className="detail-row">
        <div className="detail">
          <span className="detail-name">{t("pValue")}</span>
          <span className="detail-value">{pValue}</span>
        </div>
      </div>
      <div className="detail-row">
        <div className="detail">
          <span className="detail-name">{t("threshold")}</span>
          <span className="detail-value">{threshold}</span>
        </div>
      </div>
      <div>
        <p className="likelihood-details">
          {t("likelihoodDetailsParagraph", {
            pct: likelihoodSameDistributionsPct,
            isotopePrecision: referenceIsotopePrecision,
            isotopeRecall: referenceIsotopeRecall,
          })}
        </p>
        <p>
          {t("sampleProcessingDetailsParagraph", {
            date: dateOfSampleProcessed,
            isoscapeName: referenceIsoscapeName,
            isotopeDate: referenceIsotopeCreationDate,
          })}
        </p>
        <div className="methodology">
          <div className="methodology-title">{t("methodology")}</div>
          <p>{t("methodologyP1")}</p>
          <p>{t("methodologyP2")}</p>
          <p>
            <Trans i18nKey="methodologyP3" t={t}>
              Please see the{" "}
              <a
                target="_blank"
                href="https://timberid.gitbook.io/timberid/user-guide/glossary"
              >
                glossary
              </a>{" "}
              for further information and explanation of terms.
            </Trans>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValiditySection;
