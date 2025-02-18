import React from 'react';
import {
  useSessionQueryError,
  useStatementColumns,
  useStatementRowCount,
  useStatementStatus,
  useStatementAffectedRows,
} from '../stores/editor-store';
import { api } from '../utilities/api';
import ErrorBlock from './ErrorBlock';
import InfoBlock from './InfoBlock';
import QueryResultDataTable from './QueryResultDataTable';
import QueryResultRunning from './QueryResultRunning';
import useAppContext from '../utilities/use-app-context';

export interface Props {
  statementId?: string;
}

function QueryResultContainer({ statementId }: Props) {
  const columns = useStatementColumns(statementId) || [];
  const rowCount = useStatementRowCount(statementId);
  const status = useStatementStatus(statementId);
  const affectedRows = useStatementAffectedRows(statementId);
  const queryError = useSessionQueryError();
  const { data, error } = api.useStatementResults(statementId, status);
  const { config } = useAppContext();

  if (
    status === 'queued' ||
    status === 'started' ||
    (status === 'finished' && !data)
  ) {
    return <QueryResultRunning />;
  }
  if (queryError) {
    return <ErrorBlock>{queryError}</ErrorBlock>;
  }
  if (error) {
    return <ErrorBlock>Error getting query results</ErrorBlock>;
  }
  if (rowCount === undefined) {
    return null;
  }
  if (status === 'finished' && rowCount === 0) {
    return (
      <InfoBlock>
        Query finished
        <br />
        No rows returned
        <br />
        {affectedRows ? `${affectedRows} rows affected` : ''}
      </InfoBlock>
    );
  }
  return (
    <QueryResultDataTable
      isDownload={config?.allowCsvDownload || false}
      columns={columns}
      rows={data}
    />
  );
}

export default React.memo(QueryResultContainer);
