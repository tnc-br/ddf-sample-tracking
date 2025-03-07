import React from "react";
import { ValidityStatus } from "../../../old_components/utils";
import { useTranslation, Trans } from "react-i18next";

type Props = {
  validityLabel: string;
  city: string;
  lat: string;
  lon: string;
  isTrusted: boolean;
};

const ValidityTag: React.FC<Props> = ({
  validityLabel,
  city,
  lat,
  lon,
  isTrusted,
}) => {
  const { t } = useTranslation();

  var validity = ValidityStatus.Undetermined;
  if (isTrusted) {
    validity = ValidityStatus.Trusted;
  } else if (validityLabel == "Possible") {
    validity = ValidityStatus.Possible;
  } else if (validityLabel == "Not Likely") {
    validity = ValidityStatus.NotLikely;
  }
  // TODO: Input validity through props once it's being written to Firestore

  var validityText = "";
  var validityClass = "";
  switch (validity) {
    case ValidityStatus.Possible:
      validityText = t("possibleDescription");
      validityClass = "possible";
      break;
    case ValidityStatus.NotLikely:
      validityText = t("notLikelyDescription");
      validityClass = "not-likely";
      break;
    case ValidityStatus.Trusted:
      validityText = t("trustedDescription"); // Show an empty string if the sample is trusted
      break;
    case ValidityStatus.Undetermined:
      validityText = ""; // Show an empty string if the sample is undetermined
      break;
    default:
      break;
  }

  const tagClassName = ["validity-tag", validityClass].join(" ");

  return (
    <div>
      <div className="validity-title">
        <span className={tagClassName}>{t(validity)}</span>
        <span>{validityText}</span>
      </div>
      <div className="validity-location-subtitle">
        <span className="material-symbols-outlined">location_on</span>
        <span>{`${city ?? "Sem coordenadas"}`}</span>
        {lat && lon && <span>{` (${lat}, ${lon})`}</span>}
      </div>
    </div>
  );
};

export default ValidityTag;
