import React from "react";
import { type Sample } from "../../../old_components/utils";
import { useTranslation } from "react-i18next";

type Props = {
  selectedDoc: Sample;
  sampleId: string;
};

const SampleDetailsSection: React.FC<Props> = ({ selectedDoc, sampleId }) => {
  const { t } = useTranslation();

  return (
    <div className="details">
      <div className="section-title">{t("details")}</div>
      <div className="detail-row">
        <div className="detail">
          <span className="detail-name">{t("sampleId")}</span>
          <span className="detail-value" suppressHydrationWarning={true}>
            {sampleId}
          </span>
        </div>
        <div className="detail">
          <span className="detail-name">{t("latitude")}</span>
          <span className="detail-value">
            {selectedDoc["lat"] || "unknown"}
          </span>
        </div>
        <div className="detail">
          <span className="detail-name">{t("collectedBy")}</span>
          <span className="detail-value">{selectedDoc["collected_by"]}</span>
        </div>
      </div>

      <div className="detail-row">
        <div className="detail">
          <span className="detail-name">{t("treeSpecies")}</span>
          <span className="detail-value">
            {selectedDoc["species"] || "unknown"}
          </span>
        </div>
        <div className="detail">
          <span className="detail-name">{t("longitude")}</span>
          <span className="detail-value">
            {selectedDoc["lon"] || "unknown"}
          </span>
        </div>
        <div className="detail">
          <span className="detail-name">{t("supplierName")}</span>
          <span className="detail-value">
            {selectedDoc["supplier"] || "unknown"}
          </span>
        </div>
      </div>

      <div className="detail-row">
        <div className="detail"></div>
        <div className="detail">
          <span className="detail-name">{t("municipality")}</span>
          <span className="detail-value">
            {selectedDoc["municipality"] || "unknown"}
          </span>
        </div>
        <div className="detail">
          <span className="detail-name">{t("collectionSite")}</span>
          <span className="detail-value">
            {selectedDoc["site"] || "unknown"}
          </span>
        </div>
      </div>

      <div className="detail-row">
        <div className="detail"></div>
        <div className="detail">
          <span className="detail-name">{t("state")}</span>
          <span className="detail-value">
            {selectedDoc["state"] || "unknown"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SampleDetailsSection;
