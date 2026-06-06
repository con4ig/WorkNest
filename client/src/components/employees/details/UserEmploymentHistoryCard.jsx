import React from 'react';
import ContentCard from './ContentCard';
import EditableField from './EditableField';
import { Icon } from './UserIcons';
import { formatDateForInput, formatDateForDisplay } from './UserHelpers';

const UserEmploymentHistoryCard = ({
    isEditing,
    editData,
    employmentHistory,
    handleHistoryChange,
    handleAddHistory,
    handleRemoveHistory,
    t,
}) => {
    return (
        <ContentCard
            icon={<Icon.Briefcase />}
            title={t('employees.details.employmentHistory')}
        >
            <div className="space-y-6">
                {isEditing
                    ? editData.employmentHistory.map((item, index) => (
                          <div
                              key={item._id || `history-edit-${index}`}
                              className="rounded-lg border border-border bg-muted/50 p-4"
                          >
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <EditableField
                                      label={t('common.company')}
                                      name="company"
                                      value={item.company}
                                      onChange={(e) =>
                                          handleHistoryChange(index, e)
                                      }
                                  />
                                  <EditableField
                                      label={t('common.position')}
                                      name="position"
                                      value={item.position}
                                      onChange={(e) =>
                                          handleHistoryChange(index, e)
                                      }
                                  />
                                  <EditableField
                                      label={t('projects.labelStartDate')}
                                      name="startDate"
                                      type="date"
                                      value={formatDateForInput(item.startDate)}
                                      onChange={(e) =>
                                          handleHistoryChange(index, e)
                                      }
                                  />
                                  <EditableField
                                      label={t('projects.labelEndDate')}
                                      name="endDate"
                                      type="date"
                                      value={formatDateForInput(item.endDate)}
                                      onChange={(e) =>
                                          handleHistoryChange(index, e)
                                      }
                                  />
                              </div>
                              <textarea
                                  name="description"
                                  rows="3"
                                  placeholder={`${t('common.description')}...`}
                                  aria-label={t('common.description')}
                                  value={item.description}
                                  onChange={(e) =>
                                      handleHistoryChange(index, e)
                                  }
                                  className="mt-4 w-full rounded-lg border border-input bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              ></textarea>
                              <button
                                  type="button"
                                  onClick={() => handleRemoveHistory(index)}
                                  className="mt-2 text-sm font-semibold text-destructive hover:text-destructive/80"
                              >
                                  {t('common.delete')}
                              </button>
                          </div>
                      ))
                    : employmentHistory.map((item, index) => (
                          <div
                              key={item._id || `history-${index}`}
                              className="group relative pb-8 pl-8 last:pb-0"
                          >
                              {/* Timeline line */}
                              <div className="absolute left-0 top-2 h-full w-[2px] bg-border last:hidden" />

                              {/* Timeline dot */}
                              <div className="absolute left-[-5px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />

                              <div>
                                  <p className="text-base font-bold text-foreground">
                                      {item.position}
                                  </p>
                                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                                      <Icon.Building className="h-4 w-4" />
                                      {item.company}
                                  </p>
                                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                      {formatDateForDisplay(item.startDate)} —{' '}
                                      {formatDateForDisplay(item.endDate)}
                                  </p>
                                  <p className="mt-2 rounded-lg border border-border/10 bg-muted/20 p-3 text-sm leading-relaxed text-muted-foreground/80">
                                      {item.description}
                                  </p>
                              </div>
                          </div>
                      ))}
                {isEditing && (
                    <button
                        type="button"
                        onClick={handleAddHistory}
                        className="rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/30"
                    >
                        + {t('employees.details.addHistoryEntry')}
                    </button>
                )}
                {!isEditing && employmentHistory.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        {t('employees.details.noHistory')}
                    </p>
                )}
            </div>
        </ContentCard>
    );
};

export default UserEmploymentHistoryCard;
