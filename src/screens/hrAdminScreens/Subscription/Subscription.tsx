import React, { useEffect, useState, useRef } from 'react';
import { Get, Post } from '../../../config/apiMethods';
import { UseStateContext } from '../../../context/ContextProvider';
import { Navbar, SideDrawer } from '../../../components';
import { useSubscriptionStatus } from '../../../hooks/useSubscriptionStatus.hook';

const PRICE_ID = process.env.REACT_APP_STRIPE_PRICE_ID || '';

const Subscription: React.FC = () => {
    const { role } = UseStateContext();
    const { refreshSubscriptionStatus } = useSubscriptionStatus();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const termsContentRef = useRef<HTMLDivElement>(null);

    const fetchStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp: any = await Get('/hr-admin/subscription');
            if (resp?.success) {
                setData(resp.data);
                // Also refresh the global subscription status
                await refreshSubscriptionStatus();
            } else {
                setError(resp?.message || 'Failed to load subscription');
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to load subscription');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();

        // Check if user returned from successful Stripe checkout
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === '1') {
            // Refresh status after successful subscription
            setTimeout(() => {
                fetchStatus();
            }, 1000);
        }
    }, []);

    const handleStartSubscriptionClick = () => {
        setShowTermsModal(true);
        setHasScrolledToBottom(false);
        setAgreedToTerms(false);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10; // 10px threshold
        if (bottom && !hasScrolledToBottom) {
            setHasScrolledToBottom(true);
        }
    };

    const handleProceedToCheckout = async () => {
        if (!agreedToTerms || !hasScrolledToBottom) {
            return;
        }

        try {
            if (!PRICE_ID) {
                setError('Stripe Price ID not configured. Please contact support.');
                return;
            }
            setShowTermsModal(false);
            const resp: any = await Post('/hr-admin/subscription/checkout', { priceId: PRICE_ID });
            if (resp?.success && resp?.url) {
                window.location.href = resp.url;
            } else {
                setError(resp?.message || 'Failed to create checkout session');
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to start subscription');
            setShowTermsModal(false);
        }
    };

    const status = data?.subscription?.status;
    const seatCount = data?.seatCount || 0;

    // Calculate next billing date by adding 30 days to current period end
    const formatNextBilling = (currentPeriodEnd: string) => {
        if (!currentPeriodEnd) return { date: 'N/A', daysUntil: 0 };

        const currentEndDate = new Date(currentPeriodEnd);
        // Add 30 days to get next billing cycle
        const nextBillingDate = new Date(currentEndDate);
        nextBillingDate.setDate(currentEndDate.getDate() + 30);

        const now = new Date();
        const diffTime = nextBillingDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Format date as "Jan 7, 2026"
        const formattedDate = nextBillingDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return { date: formattedDate, daysUntil: diffDays };
    };

    const nextBilling = data?.subscription?.currentPeriodEnd ? formatNextBilling(data.subscription.currentPeriodEnd) : { date: 'N/A', daysUntil: 0 };

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
            {/* Left side */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* Right side */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-6 md:py-6 md:pr-16 bg-mainBg">
                <div className="w-full h-fit mb-4 md:mb-6">
                    <Navbar title="Subscription" />
                </div>

                <div className="w-full">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 md:p-6">
                        {loading ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-5 bg-gray-100 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                            </div>
                        ) : error ? (
                            <p className="text-red-600">{error}</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">{status || 'not subscribed'}</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-600">Employees (Seats)</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{seatCount}</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-600">Next Billing</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {nextBilling.date}
                                        {nextBilling.daysUntil > 0 && (
                                            <span className="text-sm text-gray-500 ml-1">
                                                ({nextBilling.daysUntil === 1 ? 'Tomorrow' : `${nextBilling.daysUntil} days`})
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {status !== 'active' && !loading && !error && (
                            <div className="mt-6">
                                <button onClick={handleStartSubscriptionClick} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md shadow-sm">
                                    Start Subscription
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Terms and Privacy Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Terms of Use & Privacy Policy</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Please read and scroll to the bottom to continue
                            </p>
                        </div>

                        {/* Scrollable Content */}
                        <div
                            ref={termsContentRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
                        >
                            {/* Privacy Policy */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy Policy</h3>
                                <p className="text-sm text-gray-600 mb-4"><strong>Effective Date:</strong> October 1, 2025</p>

                                <div className="space-y-4 text-gray-700 text-sm">
                                    <p>
                                        At Classerly.net, we value your trust and are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website, platform, and related services (collectively, the "Services").
                                    </p>
                                    <p>
                                        By using Classerly.net, you agree to the practices described in this Policy. If you do not agree, please discontinue use of the Services.
                                    </p>

                                    <p className="font-semibold text-gray-900 mt-6">1. Information We Collect</p>
                                    <p>We collect information in the following categories:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Account & Subscription Information:</strong> Names, emails, company details, billing information, and login credentials.</li>
                                        <li><strong>Employee & End-User Information:</strong> User profiles, email addresses, course enrolments, completions, and progress.</li>
                                        <li><strong>Content Data:</strong> Files, videos, assessments, and other materials uploaded by you or your organization.</li>
                                        <li><strong>Technical & Usage Data:</strong> Device details, IP addresses, browser type, timestamps, and feature usage.</li>
                                        <li><strong>Support & Communications:</strong> Records of emails, support tickets, and messages.</li>
                                    </ul>

                                    <p className="font-semibold text-gray-900 mt-6">2. How We Use Your Information</p>
                                    <p>We use collected information to:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Provide, operate, and maintain the Services.</li>
                                        <li>Manage accounts, authenticate users, and deliver training.</li>
                                        <li>Process payments and invoices.</li>
                                        <li>Communicate updates, support notices, and service announcements.</li>
                                        <li>Improve platform functionality, security, and performance.</li>
                                        <li>Comply with legal obligations.</li>
                                    </ul>
                                    <p className="font-medium">We do not sell or rent personal information to third parties.</p>

                                    <p className="font-semibold text-gray-900 mt-6">3. Sharing of Information</p>
                                    <p>We may share information only in the following cases:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li><strong>With Service Providers:</strong> Hosting, payment processing, analytics, and customer support vendors.</li>
                                        <li><strong>With Your Consent:</strong> If you request integrations with third-party tools.</li>
                                        <li><strong>For Legal Reasons:</strong> To comply with laws, regulations, or legal requests.</li>
                                        <li><strong>In Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                                    </ul>

                                    <p className="font-semibold text-gray-900 mt-6">4. Data Storage and Security</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Data is hosted on secure servers in Canada (or other disclosed jurisdictions).</li>
                                        <li>Encryption, role-based access, and backup protocols are in place.</li>
                                        <li>Access is restricted to authorized staff with a legitimate business need.</li>
                                        <li>While safeguards are strong, no online service can guarantee absolute security.</li>
                                    </ul>

                                    <p className="font-semibold text-gray-900 mt-6">5. Data Retention</p>
                                    <p>We retain information only as long as needed to:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Provide Services.</li>
                                        <li>Meet legal or regulatory requirements.</li>
                                        <li>Resolve disputes and enforce agreements.</li>
                                    </ul>
                                    <p>After termination of an account, data may be securely deleted or anonymized within 30–90 days, unless required by law.</p>

                                    <p className="font-semibold text-gray-900 mt-6">6. Your Rights</p>
                                    <p>Depending on your jurisdiction, you may request to:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Access, correct, or update your data.</li>
                                        <li>Request deletion, subject to legal obligations.</li>
                                        <li>Withdraw consent for optional processing.</li>
                                        <li>Obtain a copy of your data in portable format.</li>
                                    </ul>
                                    <p>Requests may be submitted to <a href="mailto:privacy@classerly.net" className="text-blue-600 hover:underline">privacy@classerly.net</a>.</p>

                                    <p className="font-semibold text-gray-900 mt-6">7. Cookies and Tracking</p>
                                    <p>We use cookies and similar tools to:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Keep you logged in.</li>
                                        <li>Remember settings and preferences.</li>
                                        <li>Analyze usage to improve the Services.</li>
                                    </ul>
                                    <p>You may disable cookies in your browser, but some features may not function properly.</p>

                                    <p className="font-semibold text-gray-900 mt-6">8. Children's Privacy</p>
                                    <p>
                                        Classerly.net is designed for business training purposes and is not intended for direct use by individuals under the age of 18.
                                    </p>
                                    <p>
                                        If your organization chooses to enroll minors as learners, your organization is solely responsible for obtaining and managing all necessary parental or guardian consents, and for ensuring compliance with all applicable child privacy laws in your jurisdiction.
                                    </p>
                                    <p>
                                        To assist with this, Classerly provides a Parental Consent Policy template that subscribing organizations may use for their own compliance. Classerly does not collect parental consents directly and assumes no responsibility for this obligation.
                                    </p>

                                    <p className="font-semibold text-gray-900 mt-6">9. International Users</p>
                                    <p>
                                        If you access the Services from outside Canada, you acknowledge that your data may be stored and processed in Canada and in jurisdictions where our service providers operate. Data protection laws in these locations may differ from those in your country.
                                    </p>

                                    <p className="font-semibold text-gray-900 mt-6">10. Changes to This Policy</p>
                                    <p>
                                        We may revise this Privacy Policy as needed. Updates will be posted on this page with a new effective date. Material changes may be communicated by email or through the platform.
                                    </p>

                                    <p className="font-semibold text-gray-900 mt-6">11. Contact Us</p>
                                    <p>If you have any questions or concerns, please reach us at:</p>
                                    <p>
                                        📧 <a href="mailto:privacy@classerly.net" className="text-blue-600 hover:underline">privacy@classerly.net</a><br />
                                        📍 Classerly.net, Ontario, Canada
                                    </p>
                                </div>
                            </div>

                            {/* Terms of Use */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Terms of Use</h3>

                                <div className="space-y-5 text-gray-700 text-sm">
                                    {/* Service Description and Acceptance */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-base mb-3">Service Description and Acceptance</h4>

                                        <p className="font-semibold text-gray-900 mt-4">1. Definitions</p>
                                        <p>For clarity in these Terms:</p>
                                        <ul className="list-disc pl-6 space-y-1 mt-2">
                                            <li>"Classerly," "we," "us," "our" means Classerly.net and its affiliates and service providers.</li>
                                            <li>"Services" means the Classerly.net learning management system and all related websites, applications, APIs, course authoring tools, analytics, support, and documentation.</li>
                                            <li>"Customer," "you," "your" means the business or organization entering into these Terms and any authorized users that access the Services under your account.</li>
                                            <li>"Customer Content" means any data, files, text, video, audio, images, quizzes, assessments, metadata, and other materials you or your users upload or create in the Services.</li>
                                            <li>"Authorized User" means an employee, contractor, or agent you permit to access the Services under your subscription.</li>
                                        </ul>

                                        <p className="font-semibold text-gray-900 mt-4">2. Service Overview</p>
                                        <p>Classerly.net provides a subscription Learning Management System engineered for business training programs. The platform enables organizations to create, deploy, and manage courses through an intuitive and scalable cloud interface. Core capabilities include:</p>
                                        <ul className="list-disc pl-6 space-y-1 mt-2">
                                            <li>Course and pathway authoring with support for multimedia content, quizzes, and assessments.</li>
                                            <li>Learner management including enrolment, roles, prerequisites, due dates, and completion rules.</li>
                                            <li>Advanced tracking with progress, engagement, and completion analytics, plus downloadable and scheduled reports.</li>
                                            <li>Integration endpoints and secure APIs designed to interoperate with HRIS and CRM systems.</li>
                                            <li>Support for common eLearning standards, including SCORM packages and LTI based connections where applicable.</li>
                                            <li>Responsive experience optimized for desktop, tablet, and mobile form factors.</li>
                                            <li>Security features such as role based access controls, SSO options where available, encryption in transit, and data segregation aligned with industry practice.</li>
                                        </ul>
                                        <p className="mt-2">The Services are delivered on a high availability architecture. We aim for reliable performance across devices and network conditions.</p>

                                        <p className="font-semibold text-gray-900 mt-4">3. Content Options and Professional Services</p>
                                        <p>You control how training content is produced and maintained:</p>
                                        <ul className="list-disc pl-6 space-y-2 mt-2">
                                            <li><strong>Self Service:</strong> You may create and upload proprietary content in a variety of formats, including video, audio, SCORM packages, PDFs, Word documents, PowerPoint files, images, interactive assessments, and surveys. The authoring experience uses a drag and drop paradigm to simplify workflow.</li>
                                            <li><strong>Collaborative Build:</strong> At your option, Classerly can assist with content strategy and production. Engagements may include needs analysis, curriculum mapping, learning objectives, storyboarding, scriptwriting, multimedia design, SCORM packaging, assessment design and validation, accessibility review, localization, and scheduled updates to maintain relevance. Scope, schedule, and pricing for such services will be documented in a separate statement of work.</li>
                                        </ul>
                                        <p className="mt-2">You are responsible for ensuring that Customer Content is accurate, lawful, properly licensed, and fit for your intended purpose.</p>

                                        <p className="font-semibold text-gray-900 mt-4">4. Acceptance of Terms</p>
                                        <p>By accessing or using the Services you agree to these Terms and you represent and warrant that:</p>
                                        <ul className="list-disc pl-6 space-y-1 mt-2">
                                            <li>You are at least eighteen years of age or are an authorized representative acting on behalf of a legal entity.</li>
                                            <li>You have the authority to bind the entity to these Terms.</li>
                                            <li>You will comply with all applicable laws.</li>
                                        </ul>
                                        <p className="mt-2">Misrepresentation of age or authority is a material breach and may result in immediate suspension or termination.</p>
                                    </div>

                                    {/* Subscription Terms */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 text-base mb-3">Subscription Terms and Account Management</h4>

                                        <p className="font-semibold text-gray-900 mt-4">5. Pricing and Billing</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>The subscription fee is $4.99 CAD per employee per month unless otherwise agreed in writing.</li>
                                            <li>Subscriptions renew monthly until canceled. Fees are charged in advance and are non-refundable once processed.</li>
                                            <li>You authorize us or our payment processor to automatically charge all applicable amounts using the payment method on file. You are responsible for keeping billing information current.</li>
                                            <li>Prices do not include taxes. You are responsible for all applicable taxes, levies, and government charges. If Classerly is required to collect taxes, such amounts will be added to your invoice.</li>
                                        </ul>

                                        <p className="font-semibold text-gray-900 mt-4">6. Seats and Usage</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>A seat corresponds to one Authorized User with access in a given billing period. Adding users increases your monthly charge on a prorated basis where applicable. Removing users takes effect in the next billing cycle.</li>
                                            <li>Access credentials are for a single person. Account sharing is not permitted.</li>
                                        </ul>

                                        <p className="font-semibold text-gray-900 mt-4">7. Account Responsibilities</p>
                                        <p>You are responsible for:</p>
                                        <ul className="list-disc pl-6 space-y-1 mt-2">
                                            <li>Maintaining the confidentiality of your credentials and enforcing strong authentication practices within your organization.</li>
                                            <li>All activities that occur under your account, including actions by Authorized Users.</li>
                                            <li>Configuring appropriate permissions and content visibility.</li>
                                            <li>Promptly notifying Classerly of any suspected security incident or unauthorized use.</li>
                                        </ul>
                                    </div>

                                    {/* Additional sections continue... */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 text-base mb-3">Intellectual Property and Licensing</h4>

                                        <p className="font-semibold text-gray-900 mt-4">8. Customer Content</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li><strong>Ownership:</strong> You retain all right, title, and interest in and to Customer Content.</li>
                                            <li><strong>License to Classerly:</strong> You grant Classerly a limited, non-exclusive, non-transferable license to host, store, process, transmit, display, and back up Customer Content solely to provide and improve the Services and to meet legal obligations.</li>
                                            <li><strong>Third Party Materials:</strong> If Customer Content includes third party materials, you represent that you have obtained all required permissions and licenses.</li>
                                            <li><strong>Data Portability:</strong> During an active subscription, you may export your reports and supported content using available tools. Additional export services may be available under a statement of work.</li>
                                        </ul>

                                        <p className="font-semibold text-gray-900 mt-4">9. Classerly Materials</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>The Services and all related software, interfaces, designs, templates, APIs, documentation, and know-how are owned by Classerly or its licensors.</li>
                                            <li>No rights are granted except as expressly stated in these Terms. You will not copy, modify, adapt, translate, create derivative works of, reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code or underlying structure of the Services except to the extent such restrictions are prohibited by law.</li>
                                            <li>Feedback, suggestions, or ideas you share may be used by Classerly to improve the Services without obligation or attribution.</li>
                                        </ul>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 text-base mb-3">Acceptable Use and Legal Protections</h4>

                                        <p className="font-semibold text-gray-900 mt-4">10. Acceptable Use</p>
                                        <p>You agree that you will not:</p>
                                        <ul className="list-disc pl-6 space-y-1 mt-2">
                                            <li>Use the Services to store or transmit content that is unlawful, defamatory, harassing, discriminatory, obscene, or infringes intellectual property, privacy, or publicity rights.</li>
                                            <li>Upload malware or attempt to probe, scan, or test the vulnerability of the Services or interfere with their operation.</li>
                                            <li>Use the Services for high-risk activities where failure could lead to death or personal injury.</li>
                                            <li>Misrepresent identity or affiliation or circumvent usage limits.</li>
                                        </ul>
                                        <p className="mt-2">We may suspend or remove content that we reasonably believe violates these Terms.</p>

                                        <p className="font-semibold text-gray-900 mt-4">11. Compliance</p>
                                        <p>You are responsible for compliance with all laws and regulations applicable to your use of the Services and to Customer Content, including labor, privacy, accessibility, and record retention requirements in the jurisdictions where you operate.</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 text-base mb-3">Security, Availability, and Support</h4>

                                        <p className="font-semibold text-gray-900 mt-4">12. Security</p>
                                        <p>Classerly implements administrative, technical, and physical safeguards designed to protect Customer Content. These include encryption in transit, logical access controls, monitoring, and regular backup procedures. No method of transmission or storage is perfectly secure. You acknowledge that risk cannot be eliminated and agree to implement reasonable security controls within your environment.</p>

                                        <p className="font-semibold text-gray-900 mt-4">13. Service Availability</p>
                                        <p>We strive for continuous availability. Planned maintenance may occasionally require temporary downtime. Where practicable, we will provide advance notice. Emergency maintenance or events outside our reasonable control may occur without notice.</p>

                                        <p className="font-semibold text-gray-900 mt-4">14. Support</p>
                                        <p>Standard support is provided via email at <a href="mailto:support@classerly.net" className="text-blue-600 hover:underline">support@classerly.net</a>. Additional support tiers, SLAs, onboarding, or admin training can be arranged under a separate agreement.</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 text-base mb-3">Warranty, Liability, and Indemnity</h4>

                                        <p className="font-semibold text-gray-900 mt-4">15. Disclaimers</p>
                                        <p>The Services are provided on an "as is" and "as available" basis. To the fullest extent permitted by law, Classerly disclaims all warranties, whether express, implied, statutory, or otherwise, including warranties of merchantability, fitness for a particular purpose, title, and non-infringement. We do not warrant that the Services will be uninterrupted, error-free, or immune from security vulnerabilities.</p>

                                        <p className="font-semibold text-gray-900 mt-4">16. Limitation of Liability</p>
                                        <p>To the fullest extent permitted by law:</p>
                                        <ul className="list-disc pl-6 space-y-1 mt-2">
                                            <li>Classerly will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, revenue, data, or goodwill, arising out of or related to these Terms or the Services.</li>
                                            <li>Classerly's aggregate liability for all claims in the aggregate will not exceed the total amount paid by you to Classerly for the Services giving rise to the claim in the twelve months preceding the event.</li>
                                        </ul>
                                        <p className="mt-2">These limitations apply regardless of the legal theory and even if a remedy fails of its essential purpose.</p>

                                        <p className="font-semibold text-gray-900 mt-4">17. Indemnification</p>
                                        <p>You will defend, indemnify, and hold harmless Classerly, its officers, directors, employees, and agents from and against any claim, demand, loss, liability, damage, cost, or expense including reasonable legal fees arising out of or related to:</p>
                                        <ul className="list-disc pl-6 space-y-1 mt-2">
                                            <li>Your use of the Services in violation of these Terms.</li>
                                            <li>Customer Content including alleged infringement, privacy violations, or other unlawful content.</li>
                                            <li>Your failure to comply with applicable law.</li>
                                        </ul>
                                        <p className="mt-2">Classerly will promptly notify you of any claim and will reasonably cooperate at your expense.</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 text-base mb-3">Term, Termination, and Data Handling</h4>

                                        <p className="font-semibold text-gray-900 mt-4">18. Term and Termination</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing cycle. No partial refunds are provided.</li>
                                            <li>We may suspend or terminate access immediately for material breaches, security threats, non-payment, or unlawful use.</li>
                                            <li>Either party may terminate if the other party materially breaches these Terms and fails to cure within thirty days after written notice.</li>
                                        </ul>

                                        <p className="font-semibold text-gray-900 mt-4">19. Effect of Termination</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Upon termination, your and your Authorized Users' access to the Services will cease.</li>
                                            <li>By request within thirty days after termination, and subject to your account being in good standing, we will make commercially reasonable efforts to enable export of remaining Customer Content in a commonly used format that the platform supports. After this period, we may delete Customer Content from active systems as part of routine operations. Backups may persist for a limited period and are purged on a rolling schedule.</li>
                                            <li>Sections intended to survive termination will remain in effect, including ownership, confidentiality, disclaimers, limitations of liability, indemnification, and governing law.</li>
                                        </ul>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 text-base mb-3">Privacy, Confidentiality, and Third Parties</h4>

                                        <p className="font-semibold text-gray-900 mt-4">20. Privacy</p>
                                        <p>Our collection, use, and disclosure of personal information are described in the Classerly Privacy Policy. By using the Services, you acknowledge that policy.</p>

                                        <p className="font-semibold text-gray-900 mt-4">21. Confidentiality</p>
                                        <p>Each party may access the other party's non-public information that is identified as confidential or that reasonably should be considered confidential. Each party will protect the other's confidential information with at least the same care it uses to protect its own confidential information and will use it only to perform under these Terms. These obligations do not apply to information that is or becomes public through no fault of the receiving party, is already known without confidentiality obligation, is independently developed without use of the confidential information, or is lawfully received from a third party without confidentiality obligation. A party may disclose confidential information if required by law after providing prompt notice and cooperating to seek protective treatment where legally permitted.</p>

                                        <p className="font-semibold text-gray-900 mt-4">22. Third Party Services</p>
                                        <p>The Services may interoperate with third party products. Your use of third party products is governed by those providers' terms and privacy policies. Classerly is not responsible for third party products or services.</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 text-base mb-3">Additional Terms</h4>

                                        <p className="font-semibold text-gray-900 mt-4">23. Modifications to the Services</p>
                                        <p>We may enhance or modify features from time to time. If a change materially reduces core functionality you relied upon for active training programs, you may contact us to discuss options.</p>

                                        <p className="font-semibold text-gray-900 mt-4">24. Free Trials and Beta Features</p>
                                        <p>From time to time, we may offer free trials or pilot features at no cost. Such features are provided for evaluation, may be changed or withdrawn at any time, and are provided without warranties or support.</p>

                                        <p className="font-semibold text-gray-900 mt-4">25. Notices</p>
                                        <p>Notices to Classerly must be sent to <a href="mailto:support@classerly.net" className="text-blue-600 hover:underline">support@classerly.net</a>. Notices to you may be provided through the Services, by email to your account email, or by posting to our website.</p>

                                        <p className="font-semibold text-gray-900 mt-4">26. Assignment</p>
                                        <p>You may not assign or transfer these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, corporate reorganization, or sale of assets.</p>

                                        <p className="font-semibold text-gray-900 mt-4">27. Force Majeure</p>
                                        <p>Neither party will be liable for delays or failures caused by events beyond its reasonable control, including natural disasters, acts of government, labor disputes, utility failures, and network or service disruptions by third parties.</p>

                                        <p className="font-semibold text-gray-900 mt-4">28. Governing Law and Venue</p>
                                        <p>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada. The parties submit to the exclusive jurisdiction and venue of the courts located in Ontario for any dispute.</p>

                                        <p className="font-semibold text-gray-900 mt-4">29. Entire Agreement and Order of Precedence</p>
                                        <p>These Terms, any order forms, and any statements of work constitute the entire agreement between the parties with respect to the Services and supersede all prior or contemporaneous understandings. If there is a conflict between these Terms and an order form or statement of work signed by both parties, the signed document will govern for the conflicting subject matter.</p>

                                        <p className="font-semibold text-gray-900 mt-4">30. Severability and Waiver</p>
                                        <p>If any provision is held unenforceable, the remainder will remain in effect. Failure to enforce a provision is not a waiver of that provision.</p>
                                    </div>

                                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-800">
                                            <strong>Support Contact:</strong><br />
                                            Questions about these Terms? Email us at <a href="mailto:support@classerly.net" className="text-blue-600 hover:underline">support@classerly.net</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer with Checkbox and Buttons */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            {!hasScrolledToBottom && (
                                <div className="mb-3 text-center">
                                    <p className="text-sm text-orange-600 font-medium">
                                        ⬇️ Please scroll to the bottom to continue
                                    </p>
                                </div>
                            )}

                            <div className="flex items-start mb-4">
                                <input
                                    type="checkbox"
                                    id="agreeToTerms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    disabled={!hasScrolledToBottom}
                                    className={`mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded ${!hasScrolledToBottom ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                />
                                <label
                                    htmlFor="agreeToTerms"
                                    className={`ml-3 text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700 cursor-pointer'}`}
                                >
                                    I have read and agree to the Terms of Use and Privacy Policy
                                </label>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleProceedToCheckout}
                                    disabled={!agreedToTerms || !hasScrolledToBottom}
                                    className={`px-6 py-2.5 rounded-md font-medium ${agreedToTerms && hasScrolledToBottom
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscription;


