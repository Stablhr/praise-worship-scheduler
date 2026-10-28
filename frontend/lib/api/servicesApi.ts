import {httpClient} from './httpClient';

export type ServiceType = 'saturday' | 'sunday';

/** One service as the app receives it. Matches ServiceDto on the server. */
export type ServiceSummary = {
  id: string;
  type: ServiceType;
  /** Manila calendar day, YYYY-MM-DD. */
  date: string;
  /** Manila start time, HH:mm. */
  time: string;
  /** The exact start instant, stored in UTC. */
  startsAt: string;
  notes?: string;
  photoUrl?: string;
};

/** A person serving a role. */
export type AssignedMember = {
  id: string;
  name: string;
  position?: string;
  photoUrl?: string;
};

/** One role of a service and who holds it, in the order the service runs. */
export type ServiceRole = {
  name: string;
  members: AssignedMember[];
};

export type ServiceDetails = {
  service: ServiceSummary;
  roles: ServiceRole[];
};

export type ServiceInput = {
  type: ServiceType;
  /** Manila calendar day, YYYY-MM-DD. */
  date: string;
  /** Manila start time, HH:mm. Left out to use the default for the type. */
  time?: string;
  notes?: string;
};

export type ServiceChanges = Partial<ServiceInput>;

export type AssignmentInput = {role: string; memberId: string};

/** Services of a range of Manila days, for the calendar. */
export async function listServices(
  from: string,
  to: string
): Promise<ServiceSummary[]> {
  const res = await httpClient.get<{services: ServiceSummary[]}>('/services', {
    params: {from, to}
  });

  return res.data.services;
}

export async function getService(id: string): Promise<ServiceDetails> {
  const res = await httpClient.get<ServiceDetails>(`/services/${id}`);
  return res.data;
}

export async function createService(
  input: ServiceInput
): Promise<ServiceSummary> {
  const res = await httpClient.post<{service: ServiceSummary}>(
    '/services',
    input
  );

  return res.data.service;
}

export async function updateService(
  id: string,
  changes: ServiceChanges
): Promise<ServiceSummary> {
  const res = await httpClient.patch<{service: ServiceSummary}>(
    `/services/${id}`,
    changes
  );

  return res.data.service;
}

export async function deleteService(id: string): Promise<void> {
  await httpClient.delete(`/services/${id}`);
}

/** Sends the finished picture: every role, and who holds it. */
export async function setAssignments(
  id: string,
  assignments: AssignmentInput[]
): Promise<ServiceRole[]> {
  const res = await httpClient.put<{roles: ServiceRole[]}>(
    `/services/${id}/assignments`,
    {assignments}
  );

  return res.data.roles;
}

/** Adds the next Saturdays and Sundays. Days that already have one are skipped. */
export async function generateServices(
  weeks = 8
): Promise<{created: ServiceSummary[]; skipped: number}> {
  const res = await httpClient.post<{
    created: ServiceSummary[];
    skipped: number;
  }>('/services/generate', {weeks});

  return res.data;
}

/** Uploads a photo for a service. Returns the updated service. */
export async function uploadServicePhoto(
  id: string,
  file: File | Blob
): Promise<ServiceSummary> {
  const formData = new FormData();
  formData.append('photo', file);

  const res = await httpClient.post<{service: ServiceSummary}>(
    `/services/${id}/photo`,
    formData,
    {headers: {'Content-Type': 'multipart/form-data'}}
  );

  return res.data.service;
}

/** Removes the photo from a service. */
export async function deleteServicePhoto(id: string): Promise<ServiceSummary> {
  const res = await httpClient.delete<{service: ServiceSummary}>(
    `/services/${id}/photo`
  );
  return res.data.service;
}
