# Sample Details Components

**Integration Point #1.** Add a new typescript component for your new section (e.g. `YourNewSection.tsx`), like:

```
import React from 'react';
import { type Sample } from '../../utils';
import { useTranslation } from 'react-i18next';

type Props = {
    selectedDoc: Sample;
};

const YourNewSection: React.FC<Props> = ({ selectedDoc }) => {
    const { t } = useTranslation();
    
    return (
        <div>
            Your content here.
        </div>
    );
};

export default YourNewSection;
```