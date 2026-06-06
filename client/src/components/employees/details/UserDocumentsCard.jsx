import React from 'react';
import ContentCard from './ContentCard';
import EditableField from './EditableField';
import { Icon } from './UserIcons';
import { formatDateForDisplay } from './UserHelpers';

const UserDocumentsCard = ({
    isEditing,
    editData,
    user,
    handleDocumentChange,
    handleAddDocument,
    handleRemoveDocument,
    t,
}) => {
    return (
        <ContentCard
            icon={<Icon.Documents />}
            title={t('employees.details.documentsAndAgreements')}
        >
            <div className="space-y-4">
                {isEditing
                    ? (editData.documents || []).map((doc, index) => (
                          <div
                              key={doc._id || `doc-edit-${index}`}
                              className="rounded-lg border border-border bg-muted/50 p-4"
                          >
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <EditableField
                                      label={t(
                                          'employees.details.documentName',
                                      )}
                                      name="name"
                                      value={doc.name}
                                      onChange={(e) =>
                                          handleDocumentChange(index, e)
                                      }
                                  />
                                  <EditableField
                                      label={t('employees.details.fileUrl')}
                                      name="url"
                                      value={doc.url}
                                      onChange={(e) =>
                                          handleDocumentChange(index, e)
                                      }
                                  />
                                  <EditableField
                                      label={t('employees.details.category')}
                                      name="category"
                                      value={doc.category}
                                      options={['documentation', 'agreement']}
                                      onChange={(e) =>
                                          handleDocumentChange(index, e)
                                      }
                                  />
                              </div>
                              <button
                                  type="button"
                                  onClick={() => handleRemoveDocument(index)}
                                  className="mt-4 text-sm font-semibold text-destructive hover:text-destructive/80"
                              >
                                  {t('employees.details.removeDocument')}
                              </button>
                          </div>
                      ))
                    : (user.documents || []).map((doc, index) => (
                          <div
                              key={doc._id || `doc-${index}`}
                              className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:bg-muted/30 sm:flex-row sm:items-center"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-primary">
                                      <Icon.Documents />
                                  </div>
                                  <div className="flex flex-col">
                                      <a
                                          href={doc.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-base font-bold text-foreground transition-colors hover:text-primary"
                                      >
                                          {doc.name}
                                      </a>
                                      <div className="mt-0.5 flex items-center gap-2">
                                          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                              {doc.category === 'agreement'
                                                  ? t(
                                                        'employees.details.agreement',
                                                    )
                                                  : t(
                                                        'employees.details.documentation',
                                                    )}
                                          </span>
                                          <span className="text-[10px] font-medium text-muted-foreground/60">
                                              {t('common.Added')}:{' '}
                                              {formatDateForDisplay(
                                                  doc.uploadedAt,
                                              )}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                              <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-white active:scale-95"
                              >
                                  Open
                              </a>
                          </div>
                      ))}

                {isEditing && (
                    <button
                        type="button"
                        onClick={handleAddDocument}
                        className="rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/30"
                    >
                        + {t('employees.details.addDocument')}
                    </button>
                )}

                {!isEditing &&
                    (!user.documents || user.documents.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                            {t('employees.details.noDocuments')}
                        </p>
                    )}
            </div>
        </ContentCard>
    );
};

export default UserDocumentsCard;
